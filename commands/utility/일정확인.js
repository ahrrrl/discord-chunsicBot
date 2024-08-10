const { SlashCommandBuilder } = require('discord.js');
const { schedules } = require('./일정');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정확인')
    .setDescription('현재 등록된 일정을 확인합니다.'),
  async execute(interaction) {
    const channelId = interaction.channelId;
    const channelSchedules = schedules.get(channelId);

    if (!channelSchedules || channelSchedules.size === 0) {
      return interaction.reply('현재 등록된 일정이 없습니다.');
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📅 현재 등록된 일정')
      .setTimestamp()
      .setFooter({
        text: '춘식이봇',
        iconURL:
          'https://img.danawa.com/prod_img/500000/876/390/img/14390876_1.jpg?shrink=330:*&_v=20210604164612',
      });

    let index = 1;
    channelSchedules.forEach((schedule, id) => {
      embed.addFields({
        name: `등록번호: ${index}`,
        value: `내용: ${schedule.content}\n시간: ${schedule.date} ${schedule.time}`,
      });
      index++;
    });

    await interaction.reply({ embeds: [embed] });
  },
};
