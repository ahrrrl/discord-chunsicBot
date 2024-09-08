import { Events } from 'discord.js';
import Guild from '../models/Guild.js';

const guildDelete = {
  name: Events.GuildDelete,
  async execute(guild) {
    try {
      // 데이터베이스에서 해당 서버 정보 삭제
      await Guild.findOneAndDelete({ guildId: guild.id });
      console.log(
        `서버 ${guild.name} (ID: ${guild.id})가 데이터베이스에서 삭제되었습니다.`
      );

      await Schedule.deleteMany({ channelId: guild.id });
      await AlarmSetting.deleteMany({ channelId: guild.id });
    } catch (error) {
      console.error(
        `서버 ${guild.name} (ID: ${guild.id}) 삭제 중 오류 발생:`,
        error
      );
    }
  },
};

export default guildDelete;
