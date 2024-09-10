import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import AlarmSetting from '../models/AlarmSetting.js';

export const data = new SlashCommandBuilder()
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
        '알람 시간 (HH:MM) / 당일알림: 10시 30분에 알람을 원하면 10:30으로 입력 / 사전알림: 일정 한 시간 전에 알람을 원하면 1:00으로 입력'
      )
      .setRequired(true)
  );

function isValidTime(time) {
  const timeRegex = /^([0-6][0-9]|7[0-2]):([0-5][0-9])$/;
  if (!timeRegex.test(time)) {
    return false;
  }

  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes <= 24 * 60;
}

export async function execute(interaction) {
  const type = interaction.options.getString('타입');
  const time = interaction.options.getString('시간');
  const channelId = interaction.channelId;

  if (!isValidTime(time)) {
    await interaction.reply({
      content:
        '유효하지 않은 시간 형식입니다. HH:MM 형식으로 00:00부터 24:00 사이의 값을 입력해주세요.',
      ephemeral: true,
    });
    return;
  }

  const newAlarmSetting = new AlarmSetting({
    channelId,
    type,
    time,
  });

  await newAlarmSetting.save();

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
        'https://chunsic-bot.vercel.app/_next/image?url=%2Fchunsic-logo.png&w=48&q=75',
    });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
