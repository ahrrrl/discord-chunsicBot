const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  channelId: String,
  scheduleId: String,
  date: String,
  time: String,
  content: String,
  jobs: [String],
});

module.exports = mongoose.model('Schedule', scheduleSchema);
