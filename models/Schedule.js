import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  channelId: String,
  scheduleId: String,
  date: String,
  time: String,
  content: String,
  mentions: [String],
  timerId: Number,
});

export default mongoose.model('Schedule', scheduleSchema);
