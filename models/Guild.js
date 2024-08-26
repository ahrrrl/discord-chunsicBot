import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
});

export default mongoose.models.Guild || mongoose.model('Guild', GuildSchema);
