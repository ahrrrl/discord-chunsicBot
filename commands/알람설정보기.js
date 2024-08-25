import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import AlarmSetting from '../models/AlarmSetting.js';

export const data = new SlashCommandBuilder()
  .setName('알람설정보기')
  .setDescription('설정된 알람을 확인합니다.');

export async function execute(interaction) {
  const channelId = interaction.channelId;
  const channelAlarms = await AlarmSetting.find({ channelId });

  if (!channelAlarms || channelAlarms.length === 0) {
    return interaction.reply({
      content: '현재 설정된 알람이 없습니다.',
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🔔 설정된 알람')
    .setTimestamp()
    .setFooter({
      text: '춘식이봇',
      iconURL:
        'https://chunsic-bot.vercel.app/_next/image?url=%2Fchunsic-logo.png&w=48&q=75',
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
}
