import { Events } from 'discord.js';
import { handleScheduleModalSubmit } from './handleScheduleModalSubmit.js';
import { handleDeleteAlarmModal } from './handleDeleteAlarmModal.js';
import { handleDeleteScheduleModal } from './handleDeleteScheduleModal.js';
import { showDeleteAlarmModal } from './showDeleteAlarmModal.js';
import { showDeleteScheduleModal } from './showDeleteScheduleModal.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // 모달 폼을 제출했을 때
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'scheduleModal') {
        await handleScheduleModalSubmit(interaction);
      } else if (interaction.customId === 'delete_alarm_modal') {
        await handleDeleteAlarmModal(interaction);
      } else if (interaction.customId === 'delete_schedule_modal') {
        await handleDeleteScheduleModal(interaction);
      }
    }
    // 채팅 입력으로 명령어를 입력했을 때
    else if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`Command not found: ${interaction.commandName}`);
        return;
      }
    }
    // 버튼을 클릭했을 때
    else if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId === 'delete_alarm') {
        await showDeleteAlarmModal(interaction);
      } else if (customId === 'delete_schedule') {
        await showDeleteScheduleModal(interaction);
      }
    }
  },
};
