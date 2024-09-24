import { Events } from 'discord.js';
import Guild from '../models/Guild.js';
import Schedule from '../models/Schedule.js';
import AlarmSetting from '../models/AlarmSetting.js';

const guildDelete = {
  name: Events.GuildDelete,
  async execute(guild) {
    console.log(guild);
    try {
      // 데이터베이스에서 해당 서버 정보 삭제
      await Guild.findOneAndDelete({ guildId: guild.id });
      console.log(
        `서버 ${guild.name} (ID: ${guild.id})가 데이터베이스에서 삭제되었습니다.`
      );
      await Schedule.deleteMany({ guildId: guild.id });
      await AlarmSetting.deleteMany({ guildId: guild.id });
      console.log(
        `서버 ${guild.name} (ID: ${guild.id})와 관련된 일정 및 알람규칙이 삭제되었습니다.`
      );
    } catch (error) {
      console.error(
        `서버 ${guild.name} (ID: ${guild.id}) 삭제 중 오류 발생:`,
        error
      );
    }
  },
};

export default guildDelete;
