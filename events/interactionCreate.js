const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const Schedule = require('../models/Schedule');
const AlarmSetting = require('../models/AlarmSetting');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`Command not found: ${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId === 'delete_alarm') {
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
      } else if (customId === 'delete_schedule') {
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
    } else if (interaction.isModalSubmit()) {
      const { customId } = interaction;

      if (customId === 'delete_alarm_modal') {
        const index = parseInt(
          interaction.fields.getTextInputValue('index'),
          10
        );
        const channelId = interaction.channelId;

        const alarms = await AlarmSetting.find({ channelId });
        if (index < 1 || index > alarms.length) {
          return interaction.reply({
            content: '유효하지 않은 인덱스 번호입니다.',
            ephemeral: true,
          });
        }

        const alarm = alarms[index - 1];
        await AlarmSetting.findByIdAndDelete(alarm._id);

        await interaction.reply({
          content: '알람이 삭제되었습니다.',
          ephemeral: true,
        });
      } else if (customId === 'delete_schedule_modal') {
        const index = parseInt(
          interaction.fields.getTextInputValue('index'),
          10
        );
        const channelId = interaction.channelId;

        const schedules = await Schedule.find({ channelId });
        if (index < 1 || index > schedules.length) {
          return interaction.reply({
            content: '유효하지 않은 인덱스 번호입니다.',
            ephemeral: true,
          });
        }

        const schedule = schedules[index - 1];
        await Schedule.findByIdAndDelete(schedule._id);

        schedule.jobs.forEach((job) => job.stop());

        await interaction.reply({
          content: '일정이 삭제되었습니다.',
          ephemeral: true,
        });
      }
    }
  },
};
