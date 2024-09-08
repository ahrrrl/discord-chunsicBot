import { EmbedBuilder } from 'discord.js';
import Schedule from '../models/Schedule.js';
import AlarmSetting from '../models/AlarmSetting.js';
import moment from 'moment-timezone';
import Server from '../models/Guild.js';

const ready = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Ready! OwO Logged in as ${client.user.tag}`);

    // 봇을 등록한 서버들을 데이터베이스에 추가
    const guilds = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
    }));

    for (const guild of guilds) {
      await Server.findOneAndUpdate(
        { guildId: guild.id },
        { guildId: guild.id, name: guild.name, icon: guild.icon },
        { upsert: true, new: true }
      );
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

      const channelAlarms = await AlarmSetting.find({
        channelId,
      });
      if (channelAlarms) {
        channelAlarms.forEach(async (alarm) => {
          let alarmTime;
          if (alarm.type === 'before') {
            alarmTime = scheduleTime.clone().subtract(alarm.time, 'minutes');
          } else if (alarm.type === 'day') {
            alarmTime = moment.tz(
              `${scheduleTime.format('YYYY-MM-DD')} ${alarm.time}`,
              'YYYY-MM-DD HH:mm',
              'Asia/Seoul'
            );
          }

          if (alarmTime > moment()) {
            const delay = alarmTime.diff(moment());
            setTimeout(async () => {
              const channel = await client.channels.fetch(schedule.channelId);

              // 일정 내용에서 @사용자아이디 추출
              const mentionRegex = /<@!?(\d+)>|<@&(\d+)>/g;
              let mentions = [];
              let match;
              while ((match = mentionRegex.exec(content)) !== null) {
                mentions.push(match[0]);
              }

              const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⏰ 알람')
                .setDescription(`${content}`)
                .addFields({
                  name: '일정 시간',
                  value: `${scheduleTime.format('YYYY-MM-DD HH:mm')}`,
                });

              const userMentions = mentions.join(' ');
              await channel.send({ content: userMentions, embeds: [embed] });
            }, delay);
          }
        });
      }

      const deleteDelay = scheduleTime.diff(moment());
      setTimeout(async () => {
        await Schedule.findOneAndDelete({
          channelId: schedule.channelId,
          scheduleId: schedule.scheduleId,
        });
        console.log(`일정 ${schedule.scheduleId}가 자동으로 삭제되었습니다.`);
      }, deleteDelay);
    });
  },
};

export default ready;
