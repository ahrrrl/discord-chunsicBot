import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  channelId: String,
  scheduleId: String,
  date: String,
  time: String,
  content: String,
  jobs: [String],
});

export default mongoose.model('Schedule', scheduleSchema);
