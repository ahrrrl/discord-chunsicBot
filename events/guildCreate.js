import Server from '../models/Guild.js';

const guildCreate = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      await Server.findOneAndUpdate(
        { guildId: guild.id },
        { guildId: guild.id, name: guild.name, icon: guild.iconURL() },
        { upsert: true, new: true }
      );
      console.log(
        `서버 ${guild.name} (ID: ${guild.id})가 데이터베이스에 추가되었습니다.`
      );
    } catch (error) {
      console.error(
        `서버 ${guild.name} (ID: ${guild.id}) 추가 중 오류 발생:`,
        error
      );
    }
  },
};

export default guildCreate;
