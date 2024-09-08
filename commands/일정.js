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
  const modal = new ModalBuilder()
    .setCustomId('scheduleModal')
    .setTitle('일정 추가');

  const dateInput = new TextInputBuilder()
    .setCustomId('date')
    .setLabel('일정 날짜 (MM-DD 또는 YYYY-MM-DD)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId('time')
    .setLabel('일정 시간 (HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

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

  const firstActionRow = new ActionRowBuilder().addComponents(dateInput);
  const secondActionRow = new ActionRowBuilder().addComponents(timeInput);
  const thirdActionRow = new ActionRowBuilder().addComponents(contentInput);
  const fourthActionRow = new ActionRowBuilder().addComponents(mentionsInput);

  modal.addComponents(
    firstActionRow,
    secondActionRow,
    thirdActionRow,
    fourthActionRow
  );

  await interaction.showModal(modal);
}

export async function handleModalSubmit(interaction) {
  const date = interaction.fields.getTextInputValue('date');
  const time = interaction.fields.getTextInputValue('time');
  const content = interaction.fields.getTextInputValue('content');
  const mentions = interaction.fields.getTextInputValue('mentions') || '';
  const channelId = interaction.channelId;

  // 날짜 형식 검증
  const dateRegex = /^(?:\d{1,2}-\d{1,2}|\d{4}-\d{1,2}-\d{1,2})$/;
  if (!dateRegex.test(date)) {
    return interaction.reply({
      content:
        '날짜 형식이 잘못되었습니다. MM-DD 또는 YYYY-MM-DD 형식으로 입력해주세요.',
      ephemeral: true,
    });
  }

  // 시간 형식 검증
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return interaction.reply({
      content: '시간 형식이 잘못되었습니다. HH:MM 형식으로 입력해주세요.',
      ephemeral: true,
    });
  }

  const dateParts = date.split('-').map(Number);
  let year, month, day;
  if (dateParts.length === 2) {
    year = new Date().getFullYear();
    [month, day] = dateParts;
  } else if (dateParts.length === 3) {
    [year, month, day] = dateParts;
  }

  const [hour, minute] = time.split(':').map(Number);
  const scheduleTime = moment.tz(
    { year, month: month - 1, day, hour, minute },
    'Asia/Seoul'
  ); // 원하는 시간대로 설정

  // 현재 시간보다 미래의 시간인지 확인
  if (scheduleTime <= moment()) {
    return interaction.reply({
      content: '과거의 시간으로 일정을 설정할 수 없습니다.',
      ephemeral: true,
    });
  }

  const scheduleId = Date.now().toString();
  const newSchedule = new Schedule({
    channelId,
    scheduleId,
    date: scheduleTime.format('YYYY-MM-DD'),
    time: scheduleTime.format('HH:mm'),
    content,
    jobs: [],
  });
  await newSchedule.save();

  const channelAlarms = await AlarmSetting.find({ channelId });
  if (channelAlarms) {
    channelAlarms.forEach(async (alarm) => {
      let alarmTime;
      if (alarm.type === 'before') {
        alarmTime = scheduleTime.clone().subtract(alarm.time, 'minutes');
      } else if (alarm.type === 'day') {
        alarmTime = moment.tz(
          `${scheduleTime.format('YYYY-MM-DD')} ${alarm.time}`,
          'YYYY-MM-DD HH:mm',
          'Asia/Seoul'
        );
      }
      // 현재 시간보다 미래의 시간인지 확인
      if (alarmTime > moment()) {
        const delay = alarmTime.diff(moment());
        setTimeout(async () => {
          const channel = await interaction.client.channels.fetch(channelId);

          // 사용자 및 역할 멘션 파싱
          const mentionNames = mentions.split('@').filter(Boolean); // '@' 단위로 스플릿하고 빈 문자열 제거
          const parsedMentions = [];
          for (const mentionName of mentionNames) {
            const name = mentionName.trim();
            const user = interaction.guild.members.cache.find(
              (member) =>
                member.user.username === name || member.user.globalName === name
            );
            const role = interaction.guild.roles.cache.find(
              (role) => role.name === name
            );
            if (user) {
              parsedMentions.push(`<@${user.id}>`); // 사용자 ID를 사용하여 멘션 생성
            }
            if (role) {
              parsedMentions.push(`<@&${role.id}>`); // 역할 ID를 사용하여 멘션 생성
            }
          }

          const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⏰ 알람')
            .setDescription(`일정 내용: ${content}`)
            .addFields({
              name: '일정 시간',
              value: `${scheduleTime.format('YYYY-MM-DD HH:mm')}`,
            });

          const userMentions = parsedMentions.join(' ');
          await channel.send({ content: userMentions, embeds: [embed] });
        }, delay);
      }
    });
  }
  // 일정 시간이 지나면 자동으로 삭제
  const deleteDelay = scheduleTime.diff(moment());
  setTimeout(async () => {
    await Schedule.findOneAndDelete({ channelId, scheduleId });
    console.log(`일정 ${scheduleId}가 자동으로 삭제되었습니다.`);
  }, deleteDelay);

  await interaction.reply({
    content: '일정이 추가되었습니다.',
    ephemeral: true,
  });
}
