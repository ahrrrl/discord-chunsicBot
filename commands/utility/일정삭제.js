const { SlashCommandBuilder } = require('discord.js');
const { schedules } = require('./일정');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정삭제')
    .setDescription('일정을 삭제합니다.')
    .addIntegerOption((option) =>
      option
        .setName('등록번호')
        .setDescription('삭제할 일정의 등록번호')
        .setRequired(true)
    ),
  async execute(interaction) {
    const index = interaction.options.getInteger('등록번호') - 1; // 등록번호를 1 감소시킴
    const channelId = interaction.channelId;

    if (!schedules.has(channelId) || schedules.get(channelId).size === 0) {
      return interaction.reply('이 채널에는 등록된 일정이 없습니다.');
    }

    const channelSchedules = schedules.get(channelId);
    const scheduleIds = Array.from(channelSchedules.keys());

    if (index < 0 || index >= scheduleIds.length) {
      return interaction.reply('유효하지 않은 등록번호입니다.');
    }

    const scheduleId = scheduleIds[index];
    const schedule = channelSchedules.get(scheduleId);

    // 모든 job 중지
    schedule.jobs.forEach((job) => job.stop());
    channelSchedules.delete(scheduleId);

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🗑️ 일정 삭제 완료')
      .setDescription(`일정 등록번호: ${index + 1}가 삭제되었습니다.`)
      .setTimestamp()
      .setFooter({
        text: '춘식이봇',
        iconURL:
          'https://img.danawa.com/prod_img/500000/876/390/img/14390876_1.jpg?shrink=330:*&_v=20210604164612',
      });

    await interaction.reply({ embeds: [embed] });
  },
};
