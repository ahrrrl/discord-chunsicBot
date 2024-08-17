const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const Schedule = require('../../models/Schedule');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정보기')
    .setDescription('등록된 일정을 확인합니다.'),
  async execute(interaction) {
    const channelId = interaction.channelId;
    const schedules = await Schedule.find({ channelId });

    if (!schedules || schedules.length === 0) {
      return interaction.reply({
        content: '현재 등록된 일정이 없습니다.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📅 등록된 일정')
      .setTimestamp()
      .setFooter({
        text: '춘식이봇',
        iconURL:
          'https://chunsic-bot.vercel.app/_next/image?url=%2Fchunsic-logo.png&w=48&q=75',
      });

    schedules.forEach((schedule, index) => {
      embed.addFields({
        name: `일정 ${index + 1}`,
        value: `날짜: ${schedule.date}\n시간: ${schedule.time}\n내용: ${schedule.content}`,
      });
    });

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
