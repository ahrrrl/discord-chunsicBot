import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  scheduleId: String,
  date: String,
  time: String,
  content: String,
  mentions: [String],
  timerId: Number,
});

export default mongoose.model('Schedule', scheduleSchema);
