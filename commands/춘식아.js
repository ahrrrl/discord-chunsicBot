import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('춘식아')
  .setDescription('춘식이가 자신을 소개합니다.');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('안녕하세요, 주인님!')
    .setDescription(
      `저는 주인님의 충실한 하인 춘식이봇입니다. 주인님을 위해 다음과 같은 명령어들을 수행할 수 있습니다:
        \n- /일정보기: 일정을 추가합니다.
        \n- /일정삭제: 일정을 삭제합니다.
        \n- /일정확인: 일정을 목록으로 보여줍니다.
        \n- /알람설정추가: 일정 알람을 추가합니다.
        \n- /알람설정보기: 설정된 알람을 확인합니다. 
        \n- 추가한 일정은 설정된 알람에 맞게 제가 메시지를 보내 알려드립니다.
        \n 그외에도 '/'을 눌러보시면 많은 명령어를 확인하실 수 있습니다!
        \n [춘식이봇 문서](https://chunsic-bot.vercel.app/)`
    )
    .setThumbnail(
      'https://chunsic-bot.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2F%EC%B6%98%EC%8B%9D%EB%B4%87%EB%A9%94%EC%9D%B8.5c460ff9.png&w=1200&q=75'
    )
    .setTimestamp()
    .setFooter({
      text: '춘식이봇',
      iconURL:
        'https://chunsic-bot.vercel.app/_next/image?url=%2Fchunsic-logo.png&w=48&q=75',
    });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
