import {
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import moment from 'moment-timezone';
import Schedule from '../models/Schedule.js';
import AlarmSetting from '../models/AlarmSetting.js';

export const data = new SlashCommandBuilder()
  .setName('일정추가')
  .setDescription('일정을 추가합니다.');

export async function execute(interaction) {
  const modal = createScheduleModal();
  await interaction.showModal(modal);
}

function createScheduleModal() {
  const now = moment().tz('Asia/Seoul');
  const currentDate = now.format('YYYY-MM-DD');
  const currentTime = now.format('HH:mm');

  const modal = new ModalBuilder()
    .setCustomId('scheduleModal')
    .setTitle('일정 추가');

  const dateInput = new TextInputBuilder()
    .setCustomId('date')
    .setLabel('일정 날짜 (MM-DD 또는 YYYY-MM-DD)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(currentDate);

  const timeInput = new TextInputBuilder()
    .setCustomId('time')
    .setLabel('일정 시간 (HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(currentTime);

  const contentInput = new TextInputBuilder()
    .setCustomId('content')
    .setLabel('일정 내용')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const mentionsInput = new TextInputBuilder()
    .setCustomId('mentions')
    .setLabel('멘션할 사용자 및 역할 (@사용자이름 @역할이름)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const actionRows = [dateInput, timeInput, contentInput, mentionsInput].map(
    (input) => new ActionRowBuilder().addComponents(input)
  );

  modal.addComponents(...actionRows);
  return modal;
}

export async function handleModalSubmit(interaction) {
  const { date, time, content, mentions } = getModalValues(interaction);
  const channelId = interaction.channelId;

  const parsedMentions = await parseMentions(interaction, mentions);

  const validationResult = validateDateTime(date, time);
  if (validationResult !== true) {
    return interaction.reply({
      content: validationResult,
      ephemeral: true,
    });
  }

  const scheduleTime = parseScheduleTime(date, time);

  if (!isValidScheduleTime(scheduleTime)) {
    return interaction.reply({
      content: '과거의 시간이나 1달 이후의 시간으로 일정을 설정할 수 없습니다.',
      ephemeral: true,
    });
  }

  const scheduleId = Date.now().toString();
  await saveSchedule(
    channelId,
    scheduleId,
    scheduleTime,
    content,
    parsedMentions
  );

  await setAlarms(
    interaction,
    channelId,
    scheduleTime,
    content,
    parsedMentions
  );

  await setScheduleAutoDelete(channelId, scheduleId, scheduleTime);

  await interaction.reply({
    content: '일정이 추가되었습니다.',
    ephemeral: true,
  });
}

function getModalValues(interaction) {
  return {
    date: interaction.fields.getTextInputValue('date'),
    time: interaction.fields.getTextInputValue('time'),
    content: interaction.fields.getTextInputValue('content'),
    mentions: interaction.fields.getTextInputValue('mentions') || '',
  };
}

async function parseMentions(interaction, mentions) {
  const mentionNames = mentions
    .split('@')
    .filter(Boolean)
    .map((name) => name.trim());
  const parsedMentions = [];
  for (const mentionName of mentionNames) {
    const user = interaction.guild.members.cache.find(
      (member) =>
        member.user.username === mentionName ||
        member.user.globalName === mentionName
    );
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === mentionName
    );
    if (user) parsedMentions.push(`<@${user.id}>`);
    if (role) parsedMentions.push(`<@&${role.id}>`);
  }
  return parsedMentions;
}

function validateDateTime(date, time) {
  const dateRegex = /^(?:\d{1,2}-\d{1,2}|\d{4}-\d{1,2}-\d{1,2})$/;
  if (!dateRegex.test(date)) {
    return '날짜 형식이 잘못되었습니다. MM-DD 또는 YYYY-MM-DD 형식으로 입력해주세요.';
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return '시간 형식이 잘못되었습니다. HH:MM 형식으로 입력해주세요.';
  }

  return true;
}

function parseScheduleTime(date, time) {
  const dateParts = date.split('-').map(Number);
  let year, month, day;
  if (dateParts.length === 2) {
    year = new Date().getFullYear();
    [month, day] = dateParts;
  } else {
    [year, month, day] = dateParts;
  }

  const [hour, minute] = time.split(':').map(Number);
  return moment.tz({ year, month: month - 1, day, hour, minute }, 'Asia/Seoul');
}

function isValidScheduleTime(scheduleTime) {
  const now = moment().tz('Asia/Seoul');
  const maxAllowedTime = now.clone().add(1, 'month');
  return scheduleTime > now && scheduleTime <= maxAllowedTime;
}

async function saveSchedule(
  channelId,
  scheduleId,
  scheduleTime,
  content,
  parsedMentions
) {
  const newSchedule = new Schedule({
    channelId,
    scheduleId,
    date: scheduleTime.format('YYYY-MM-DD'),
    time: scheduleTime.format('HH:mm'),
    content,
    mentions: parsedMentions,
  });
  await newSchedule.save();
}

async function setAlarms(
  interaction,
  channelId,
  scheduleTime,
  content,
  parsedMentions
) {
  const channelAlarms = await AlarmSetting.find({ channelId });
  channelAlarms.forEach(async (alarm) => {
    const alarmTime = calculateAlarmTime(alarm, scheduleTime);
    if (alarmTime > moment()) {
      const delay = alarmTime.diff(moment());
      setTimeout(async () => {
        const channel = await interaction.client.channels.fetch(channelId);
        const embed = createAlarmEmbed(content, scheduleTime);
        const userMentions = parsedMentions.join(' ');
        await channel.send({ content: userMentions, embeds: [embed] });
      }, delay);
    }
  });
}

function calculateAlarmTime(alarm, scheduleTime) {
  if (alarm.type === 'before') {
    return scheduleTime.clone().subtract(alarm.time, 'minutes');
  } else if (alarm.type === 'day') {
    return moment.tz(
      `${scheduleTime.format('YYYY-MM-DD')} ${alarm.time}`,
      'YYYY-MM-DD HH:mm',
      'Asia/Seoul'
    );
  }
}

function createAlarmEmbed(content, scheduleTime) {
  return new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('⏰ 알람')
    .setDescription(content)
    .addFields({
      name: '일정 시간',
      value: scheduleTime.format('YYYY-MM-DD HH:mm'),
    });
}

async function setScheduleAutoDelete(channelId, scheduleId, scheduleTime) {
  const deleteDelay = scheduleTime.diff(moment());
  setTimeout(async () => {
    await Schedule.findOneAndDelete({ channelId, scheduleId });
    console.log(`일정 ${scheduleId}가 자동으로 삭제되었습니다.`);
  }, deleteDelay);
}
