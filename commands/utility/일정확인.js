const { SlashCommandBuilder } = require('discord.js');
const schedules = require('./일정').schedules;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정확인')
    .setDescription('현재 등록된 일정을 확인합니다.'),
  async execute(interaction) {
    const channelId = interaction.channelId;

    if (!schedules.has(channelId) || schedules.get(channelId).size === 0) {
      return interaction.reply('이 채널에는 등록된 일정이 없습니다.');
    }

    const channelSchedules = schedules.get(channelId);
    let replyMessage = '현재 등록된 일정:\n';

    let index = 1; // 등록번호를 1부터 시작
    channelSchedules.forEach((schedule, id) => {
      replyMessage += `\n**등록번호**: ${index}\n**날짜**: ${schedule.date}\n**시간**: ${schedule.time}\n**내용**: ${schedule.content}\n`;
      index++;
    });

    await interaction.reply(replyMessage);
  },
};
