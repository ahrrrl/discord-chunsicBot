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
    const scheduleTime = new Date(year, month - 1, day, hour, minute);
    const scheduleId = Date.now().toString();
    const channelSchedules = schedules.get(channelId);
    channelSchedules.set(scheduleId, {
      date: `${year}-${month}-${day}`,
      time,
      content,
      jobs: [],
    });

    // 현재 시간보다 미래의 시간인지 확인
    if (scheduleTime <= new Date()) {
      return interaction.reply('과거의 시간으로 일정을 설정할 수 없습니다.');
    }

    // 30분 전 알림
    const reminderTime = new Date(scheduleTime.getTime() - 30 * 60000);
    if (reminderTime > new Date()) {
      const reminderJob = new CronJob(reminderTime, async () => {
        const channel = await interaction.client.channels.fetch(channelId);
        channel.send(
          `30분 후 일정이 있습니다: ${year}-${month}-${day} ${time} - ${content}`
        );
      });
      reminderJob.start();
      channelSchedules.get(scheduleId).jobs.push(reminderJob);
    }

    // 당일 오전 10시 알림
    const morningJob = new CronJob(`0 10 ${day} ${month} *`, async () => {
      const channel = await interaction.client.channels.fetch(channelId);
      channel.send(
        `오늘 일정이 있습니다: ${year}-${month}-${day} ${time} - ${content}`
      );
    });
    morningJob.start();
    channelSchedules.get(scheduleId).jobs.push(morningJob);

    // 일정 시간 알림 및 삭제
    const mainJob = new CronJob(scheduleTime, async () => {
      const channel = await interaction.client.channels.fetch(channelId);
      channel.send(
        `일정 시간입니다: ${year}-${month}-${day} ${time} - ${content}`
      );

      // 모든 job 중지
      channelSchedules.get(scheduleId).jobs.forEach((job) => job.stop());

      // 일정 삭제
      channelSchedules.delete(scheduleId);
    });
    mainJob.start();
    channelSchedules.get(scheduleId).jobs.push(mainJob);

    await interaction.reply(
      `일정이 추가되었습니다: ${year}-${month}-${day} ${time} - ${content}`
    );
  },
};
