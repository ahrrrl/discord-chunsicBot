import AlarmSetting from '../models/AlarmSetting.js';

export async function handleDeleteAlarmModal(interaction) {
  const index = parseInt(interaction.fields.getTextInputValue('index'), 10);
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
}
