const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { schedules } = require('./일정');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정확인')
    .setDescription('등록된 일정을 확인합니다.'),
  async execute(interaction) {
    const channelId = interaction.channelId;
    const channelSchedules = schedules.get(channelId);

    if (!channelSchedules || channelSchedules.size === 0) {
      return interaction.reply('현재 등록된 일정이 없습니다.');
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📅 등록된 일정')
      .setTimestamp()
      .setFooter({
        text: '춘식이봇',
        iconURL:
          'https://img.danawa.com/prod_img/500000/876/390/img/14390876_1.jpg?shrink=330:*&_v=20210604164612',
      });

    Array.from(channelSchedules.entries()).forEach(
      ([scheduleId, schedule], index) => {
        embed.addFields({
          name: `일정 ${index + 1}`,
          value: `날짜: ${schedule.date}\n시간: ${schedule.time}\n내용: ${schedule.content}`,
        });
      }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('delete_schedule')
        .setLabel('일정 삭제')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
