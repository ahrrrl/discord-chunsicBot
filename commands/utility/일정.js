const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { SlashCommandBuilder } = require('discord.js');
const { CronJob } = require('cron');
const schedules = new Map();

module.exports = {
  schedules,
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
    const scheduleId = Date.now().toString();
    const channelSchedules = schedules.get(channelId);
    channelSchedules.set(scheduleId, {
      date: scheduleTime.format('YYYY-MM-DD'),
      time: scheduleTime.format('HH:mm'),
      content,
      jobs: [],
    });
    // 현재 시간보다 미래의 시간인지 확인
    if (scheduleTime <= moment()) {
      return interaction.reply('과거의 시간으로 일정을 설정할 수 없습니다.');
    }
    // 30분 전 알림
    const reminderTime = scheduleTime.clone().subtract(30, 'minutes');
    if (reminderTime > moment()) {
      const reminderJob = new CronJob(reminderTime.toDate(), async () => {
        const channel = await interaction.client.channels.fetch(channelId);
        const embed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('⏰ 30분 후 일정 알림')
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
        channel.send({ embeds: [embed] });
      });
      reminderJob.start();
      channelSchedules.get(scheduleId).jobs.push(reminderJob);
    }
    // 당일 오전 10시 알림
    const morningJob = new CronJob(`0 10 ${day} ${month} *`, async () => {
      const channel = await interaction.client.channels.fetch(channelId);
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🌅 오늘의 일정 알림')
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
      channel.send({ embeds: [embed] });
    });
    morningJob.start();
    channelSchedules.get(scheduleId).jobs.push(morningJob);
    // 일정 시간 알림 및 삭제
    const mainJob = new CronJob(scheduleTime.toDate(), async () => {
      const channel = await interaction.client.channels.fetch(channelId);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('📅 일정 시간 알림')
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
      channel.send({ embeds: [embed] });
      // 모든 job 중지
      channelSchedules.get(scheduleId).jobs.forEach((job) => job.stop());
      // 일정 삭제
      channelSchedules.delete(scheduleId);
    });
    mainJob.start();
    channelSchedules.get(scheduleId).jobs.push(mainJob);
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
