import { Events } from 'discord.js';
import { showDeleteAlarmModal } from './buttonEvents/showDeleteAlarmModal.js';
import { showDeleteScheduleModal } from './buttonEvents/showDeleteScheduleModal.js';
import { handleScheduleModalSubmit } from './formSubmitEvent/handleScheduleModalSubmit.js';
import { handleDeleteAlarmModal } from './formSubmitEvent/handleDeleteAlarmModal.js';
import { handleDeleteScheduleModal } from './formSubmitEvent/handleDeleteScheduleModal.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'scheduleModal') {
        await handleScheduleModalSubmit(interaction);
      } else if (interaction.customId === 'delete_alarm_modal') {
        await handleDeleteAlarmModal(interaction);
      } else if (interaction.customId === 'delete_schedule_modal') {
        await handleDeleteScheduleModal(interaction);
      }
    } else if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`Command not found: ${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: '명령어 실행 중 오류가 발생했습니다.',
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const { customId } = interaction;
      if (customId === 'delete_alarm') {
        await showDeleteAlarmModal(interaction);
      } else if (customId === 'delete_schedule') {
        await showDeleteScheduleModal(interaction);
      }
    }
  },
};
