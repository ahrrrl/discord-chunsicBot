import { SlashCommandBuilder } from 'discord.js';
import Schedule from '../models/Schedule.js';

export const data = new SlashCommandBuilder()
  .setName('일정삭제')
  .setDescription('등록된 일정을 삭제합니다.')
  .addIntegerOption((option) =>
    option
      .setName('인덱스')
      .setDescription('삭제할 일정의 인덱스 번호')
      .setRequired(true)
  );

export async function execute(interaction) {
  const index = interaction.options.getInteger('인덱스');
  const channelId = interaction.channelId;

  const schedules = await Schedule.find({ channelId });
  if (index < 1 || index > schedules.length) {
    return interaction.reply('유효하지 않은 인덱스 번호입니다.');
  }

  const schedule = schedules[index - 1];
  await Schedule.findByIdAndDelete(schedule._id);

  schedule.jobs.forEach((job) => job.stop());

  await interaction.reply('일정이 삭제되었습니다.');
}
