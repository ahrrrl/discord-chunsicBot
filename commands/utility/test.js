const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('테스트를 위한 커멘드입니다.'),
  async execute(interaction) {
    await interaction.reply({ content: '테스트!', ephemeral: true });
  },
};
