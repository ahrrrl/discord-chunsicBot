const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { alarmSettings } = require('./일정');
const moment = require('moment-timezone');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('알람설정추가')
    .setDescription('일정 알람을 추가합니다(기존 일정에는 적용되지 않습니다).')
    .addStringOption((option) =>
      option
        .setName('타입')
        .setDescription('알람 타입 (사전알림 또는 당일알림)')
        .setRequired(true)
        .addChoices(
          { name: '사전알림', value: 'before' },
          { name: '당일알림', value: 'day' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('시간')
        .setDescription(
          '알람 시간 (HH:MM) / 당일알람: 10시 30분에 알람을 원하면 10:30으로 입력 / 사전알림: 일정 한 시간 전에 알람을 원하면 1:00으로 입력'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const type = interaction.options.getString('타입');
    const time = interaction.options.getString('시간');
    const channelId = interaction.channelId;

    if (!alarmSettings.has(channelId)) {
      alarmSettings.set(channelId, []);
    }

    alarmSettings.get(channelId).push({
      type,
      time,
    });

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🔔 알람 설정 추가')
      .setDescription('새로운 알람 설정이 추가되었습니다.')
      .addFields(
        {
          name: '알람 타입',
          value: type === 'before' ? '사전알림' : '당일알림',
          inline: true,
        },
        { name: '알람 시간', value: time, inline: true }
      )
      .setTimestamp()
      .setFooter({
        text: '춘식이봇',
        iconURL:
          'https://img.danawa.com/prod_img/500000/876/390/img/14390876_1.jpg?shrink=330:*&_v=20210604164612',
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
