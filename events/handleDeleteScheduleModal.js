import Schedule from '../models/Schedule.js';

export async function handleDeleteScheduleModal(interaction) {
  const index = parseInt(interaction.fields.getTextInputValue('index'), 10);
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

  await interaction.reply({
    content: '일정이 삭제되었습니다.',
    ephemeral: true,
  });
}
