import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

export async function showDeleteAlarmModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('delete_alarm_modal')
    .setTitle('알람 삭제');

  const indexInput = new TextInputBuilder()
    .setCustomId('index')
    .setLabel('삭제할 알람의 인덱스 번호를 입력하세요')
    .setStyle(TextInputStyle.Short);

  const actionRow = new ActionRowBuilder().addComponents(indexInput);
  modal.addComponents(actionRow);

  await interaction.showModal(modal);
}
