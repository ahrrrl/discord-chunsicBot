import Schedule from '../models/Schedule.js';
import moment from 'moment-timezone';
import Server from '../models/Guild.js';
import { setAlarms } from './handleScheduleModalSubmit.js';

const ready = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Ready! OwO Logged in as ${client.user.tag}`);

    // 봇이 이미 등록된 서버들을 데이터베이스에 추가
    const guilds = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
    }));

    for (const guild of guilds) {
      const existingGuild = await Server.findOne({ guildId: guild.id });

      if (
        !existingGuild ||
        existingGuild.name !== guild.name ||
        existingGuild.icon !== guild.icon
      ) {
        await Server.findOneAndUpdate(
          { guildId: guild.id },
          { guildId: guild.id, name: guild.name, icon: guild.icon },
          { upsert: true, new: true }
        );
        console.log(
          `서버 ${guild.name} (ID: ${guild.id})가 데이터베이스에 추가 또는 업데이트되었습니다.`
        );
      }
    }

    // 일정 알람 재설정
    const schedules = await Schedule.find();
    schedules.forEach(async (schedule) => {
      const scheduleTime = moment.tz(
        `${schedule.date} ${schedule.time}`,
        'YYYY-MM-DD HH:mm',
        'Asia/Seoul'
      );

      const channelId = schedule.channelId;
      const content = schedule.content;
      const parsedMentions = schedule.mentions;

      await setAlarms(
        { client }, // interaction 객체 대신 client 객체 전달
        channelId,
        schedule.scheduleId,
        scheduleTime,
        content,
        parsedMentions
      );
    });
  },
};

export default ready;
