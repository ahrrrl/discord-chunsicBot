const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { SlashCommandBuilder } = require('discord.js');
const { CronJob } = require('cron');
const schedules = new Map();
const alarmSettings = new Map();

module.exports = {
  schedules,
  alarmSettings,
  data: new SlashCommandBuilder()
    .setName('일정추가')
    .setDescription('일정을 추가합니다.')
    .addStringOption((option) =>
      option
        .setName('날짜')
        .setDescription('일정 날짜 (MM-DD 또는 YYYY-MM-DD)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('시간')
        .setDescription('일정 시간 (HH:MM)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('내용').setDescription('일정 내용').setRequired(true)
    ),
  async execute(interaction) {
    let date = interaction.options.getString('날짜');
    const time = interaction.options.getString('시간');
    const content = interaction.options.getString('내용');
    const channelId = interaction.channelId;
    if (!schedules.has(channelId)) {
      schedules.set(channelId, new Map());
    }
    const dateParts = date.split('-').map(Number);
    let year, month, day;
    if (dateParts.length === 2) {
      year = new Date().getFullYear();
      [month, day] = dateParts;
    } else if (dateParts.length === 3) {
      [year, month, day] = dateParts;
    } else {
      return interaction.reply(
        '날짜 형식이 잘못되었습니다. MM-DD 또는 YYYY-MM-DD 형식으로 입력해주세요.'
      );
    }
    const [hour, minute] = time.split(':').map(Number);
    const scheduleTime = moment.tz(
      { year, month: month - 1, day, hour, minute },
      'Asia/Seoul'
    ); // 원하는 시간대로 설정

    // 현재 시간보다 미래의 시간인지 확인
    if (scheduleTime <= moment()) {
      return interaction.reply('과거의 시간으로 일정을 설정할 수 없습니다.');
    }

    const scheduleId = Date.now().toString();
    const channelSchedules = schedules.get(channelId);
    channelSchedules.set(scheduleId, {
      date: scheduleTime.format('YYYY-MM-DD'),
      time: scheduleTime.format('HH:mm'),
      content,
      jobs: [],
    });

    // 전역 알람 설정 참조
    const channelAlarms = alarmSettings.get(channelId);
    if (channelAlarms) {
      channelAlarms.forEach((alarm) => {
        let alarmTime;
        if (alarm.type === 'before') {
          alarmTime = scheduleTime.clone().subtract(alarm.time, 'minutes');
        } else if (alarm.type === 'day') {
          alarmTime = moment(
            scheduleTime.format('YYYY-MM-DD') + ' ' + alarm.time,
            'YYYY-MM-DD HH:mm'
          );
        }
        if (alarmTime > moment()) {
          const alarmJob = new CronJob(alarmTime.toDate(), async () => {
            const channel = await interaction.client.channels.fetch(channelId);
            const embed = new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('⏰ 알람')
              .setDescription(`일정 내용: ${content}`)
              .addFields({
                name: '일정 시간',
                value: scheduleTime.format('YYYY-MM-DD HH:mm'),
              })
              .setTimestamp()
              .setFooter({
                text: '춘식이봇',
                iconURL:
                  'https://img.danawa.com/prod_img/500000/876/390/img/14390876_1.jpg?shrink=330:*&_v=20210604164612',
              });

            // @사용자이름을 임베드 밖으로 꺼내기
            const mentionRegex = /@(\w+)/g;
            let mentions = '';
            let match;
            while ((match = mentionRegex.exec(content)) !== null) {
              mentions += `<@${match[1]}> `;
            }

            if (mentions) {
              channel.send(mentions);
            }
            channel.send({ embeds: [embed] });
          });
          alarmJob.start();
          channelSchedules.get(scheduleId).jobs.push(alarmJob);
        }
      });
    }

    // 일정 시간이 지나면 자동으로 삭제하는 CronJob 추가
    const deleteJob = new CronJob(scheduleTime.toDate(), async () => {
      const channelSchedules = schedules.get(channelId);
      if (channelSchedules && channelSchedules.has(scheduleId)) {
        const schedule = channelSchedules.get(scheduleId);
        // 모든 job 중지
        schedule.jobs.forEach((job) => job.stop());
        channelSchedules.delete(scheduleId);
        console.log(`일정 ${scheduleId}가 자동으로 삭제되었습니다.`);
      }
    });
    deleteJob.start();
    channelSchedules.get(scheduleId).jobs.push(deleteJob);

    const embed = new EmbedBuilder()
      .setColor('#0000FF')
      .setTitle('✅ 일정 추가 완료')
      .setDescription(`일정 내용: ${content}`)
      .addFields({
        name: '일정 시간',
        value: scheduleTime.format('YYYY-MM-DD HH:mm'),
      })
      .setTimestamp()
      .setFooter({
        text: '춘식이봇',
        iconURL:
          'https://img.danawa.com/prod_img/500000/876/390/img/14390876_1.jpg?shrink=330:*&_v=20210604164612',
      });

    await interaction.reply({ embeds: [embed] });
  },
};
