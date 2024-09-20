import {
  ActionRowBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import moment from 'moment-timezone';

export const data = new SlashCommandBuilder()
  .setName('일정추가')
  .setDescription('일정을 추가합니다.');

export async function execute(interaction) {
  const modal = createScheduleModal();
  await interaction.showModal(modal);
}

function createScheduleModal() {
  const now = moment().tz('Asia/Seoul');
  const currentDate = now.format('YYYY-MM-DD');
  const currentTime = now.format('HH:mm');

  const modal = new ModalBuilder()
    .setCustomId('scheduleModal')
    .setTitle('일정 추가');

  const dateInput = new TextInputBuilder()
    .setCustomId('date')
    .setLabel('일정 날짜 (MM-DD 또는 YYYY-MM-DD)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(currentDate);

  const timeInput = new TextInputBuilder()
    .setCustomId('time')
    .setLabel('일정 시간 (HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(currentTime);

  const contentInput = new TextInputBuilder()
    .setCustomId('content')
    .setLabel('일정 내용')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const mentionsInput = new TextInputBuilder()
    .setCustomId('mentions')
    .setLabel('멘션할 사용자 및 역할 (@사용자이름 @역할이름)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const actionRows = [dateInput, timeInput, contentInput, mentionsInput].map(
    (input) => new ActionRowBuilder().addComponents(input)
  );

  modal.addComponents(...actionRows);
  return modal;
}
