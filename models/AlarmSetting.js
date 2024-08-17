const mongoose = require('mongoose');

const alarmSettingSchema = new mongoose.Schema({
  channelId: String,
  type: String,
  time: String,
});

module.exports = mongoose.model('AlarmSetting', alarmSettingSchema);
