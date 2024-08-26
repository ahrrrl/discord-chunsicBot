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

      // 해당 서버와 관련된 다른 데이터(예: 일정, 알람 설정 등) 삭제
      // 필요에 따라 다음과 같은 코드를 추가할 수 있습니다:
      // await Schedule.deleteMany({ guildId: guild.id });
      // await AlarmSetting.deleteMany({ guildId: guild.id });
    } catch (error) {
      console.error(
        `서버 ${guild.name} (ID: ${guild.id}) 삭제 중 오류 발생:`,
        error
      );
    }
  },
};

export default guildDelete;
