import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

export async function showDeleteScheduleModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('delete_schedule_modal')
    .setTitle('일정 삭제');

  const indexInput = new TextInputBuilder()
    .setCustomId('index')
    .setLabel('삭제할 일정의 인덱스 번호를 입력하세요')
    .setStyle(TextInputStyle.Short);

  const actionRow = new ActionRowBuilder().addComponents(indexInput);
  modal.addComponents(actionRow);

  await interaction.showModal(modal);
}
