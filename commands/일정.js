import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import moment from 'moment-timezone';
import Schedule from '../models/Schedule.js';
import AlarmSetting from '../models/AlarmSetting.js';

export const data = new SlashCommandBuilder()
  .setName('일정추가')
  .setDescription('일정을 추가합니다.')
  .addStringOption((option) =>
    option
      .setName('날짜')
      .setDescription('일정 날짜 (MM-DD 또는 YYYY-MM-DD)')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('시간').setDescription('일정 시간 (HH:MM)').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('내용').setDescription('일정 내용').setRequired(true)
  );

export async function execute(interaction) {
  let date = interaction.options.getString('날짜');
  const time = interaction.options.getString('시간');
  const content = interaction.options.getString('내용');
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

          // 일정 내용에서 @사용자아이디 추출
          const mentionRegex = /<@!?(\d+)>|<@&(\d+)>/g;
          let mentions = [];
          let match;
          while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[0]);
          }

          const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⏰ 알람')
            .setDescription(`일정 내용: ${content}`)
            .addFields({
              name: '일정 시간',
              value: `${scheduleTime.format('YYYY-MM-DD HH:mm')}`,
            });

          const userMentions = mentions.join(' ');
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
