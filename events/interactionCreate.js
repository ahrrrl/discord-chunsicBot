const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const { alarmSettings, schedules } = require('../commands/utility/일정');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === 'delete_schedule') {
        const modal = new ModalBuilder()
          .setCustomId('delete_schedule_modal')
          .setTitle('일정 삭제');

        const scheduleIdInput = new TextInputBuilder()
          .setCustomId('schedule_id')
          .setLabel('삭제할 일정의 번호를 입력하세요')
          .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(
          scheduleIdInput
        );
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
      } else if (interaction.customId === 'delete_alarm') {
        const modal = new ModalBuilder()
          .setCustomId('delete_alarm_modal')
          .setTitle('알람 삭제');

        const alarmIdInput = new TextInputBuilder()
          .setCustomId('alarm_id')
          .setLabel('삭제할 알람의 번호를 입력하세요')
          .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(
          alarmIdInput
        );
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'delete_schedule_modal') {
        const scheduleId = interaction.fields.getTextInputValue('schedule_id');
        const channelId = interaction.channelId;
        const channelSchedules = schedules.get(channelId);

        if (!channelSchedules || channelSchedules.size === 0) {
          return interaction.reply('현재 등록된 일정이 없습니다.');
        }

        const scheduleIds = Array.from(channelSchedules.keys());
        const index = parseInt(scheduleId) - 1;

        if (isNaN(index) || index < 0 || index >= scheduleIds.length) {
          return interaction.reply('유효하지 않은 일정 번호입니다.');
        }

        const scheduleIdToDelete = scheduleIds[index];
        const schedule = channelSchedules.get(scheduleIdToDelete);

        // 모든 job 중지
        schedule.jobs.forEach((job) => job.stop());
        channelSchedules.delete(scheduleIdToDelete);

        await interaction.reply(`일정 ${index + 1}가 삭제되었습니다.`);
      } else if (interaction.customId === 'delete_alarm_modal') {
        const alarmId = interaction.fields.getTextInputValue('alarm_id');
        const channelId = interaction.channelId;
        const channelAlarms = alarmSettings.get(channelId);

        if (!channelAlarms || channelAlarms.length === 0) {
          return interaction.reply('현재 설정된 알람이 없습니다.');
        }

        const index = parseInt(alarmId) - 1;

        if (isNaN(index) || index < 0 || index >= channelAlarms.length) {
          return interaction.reply('유효하지 않은 알람 번호입니다.');
        }

        channelAlarms.splice(index, 1);
        alarmSettings.set(channelId, channelAlarms);

        await interaction.reply(`알람 ${index + 1}가 삭제되었습니다.`);
      }
    }
  },
};
