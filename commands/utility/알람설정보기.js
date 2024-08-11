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
const { alarmSettings } = require('./일정');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('알람설정보기')
    .setDescription('설정된 알람을 확인합니다.'),
  async execute(interaction) {
    const channelId = interaction.channelId;
    const channelAlarms = alarmSettings.get(channelId);

    if (!channelAlarms || channelAlarms.length === 0) {
      return interaction.reply('현재 설정된 알람이 없습니다.');
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🔔 설정된 알람')
      .setTimestamp()
      .setFooter({
        text: '춘식이봇',
        iconURL:
          'https://img.danawa.com/prod_img/500000/876/390/img/14390876_1.jpg?shrink=330:*&_v=20210604164612',
      });

    channelAlarms.forEach((alarm, index) => {
      embed.addFields({
        name: `알람 ${index + 1}`,
        value: `타입: ${alarm.type === 'before' ? '일정전' : '당일'}\n시간: ${
          alarm.time
        }`,
      });
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('delete_alarm')
        .setLabel('알람 삭제')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
