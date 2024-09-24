import mongoose from 'mongoose';

const alarmSettingSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  type: String,
  time: String,
});

export default mongoose.model('AlarmSetting', alarmSettingSchema);
