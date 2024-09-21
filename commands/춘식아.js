import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('춘식아')
  .setDescription('춘식이가 자신을 소개합니다.');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('안녕하세요, 주인님!')
    .setDescription(
      `저는 주인님의 충실한 하인 춘식이봇입니다.
        \n- /알람규칙추가: 알람규칙을 추가합니다.
        \n- /알람규칙보기: 설정된 알람규칙을 확인합니다.  
        \n- /일정추가: 일정을 추가합니다.
        \n- /일정보기: 일정을 목록으로 보여줍니다.

        \n 일정만 추가한다고 해서 알람이 울리지 않습니다. 알람규칙추가를 통해 알람패턴을 추가해주세요! 서버 내 알람규칙은 모든 일정에 적용됩니다.
        \n 반드시 알람규칙추가를 먼저 하시고 일정을 추가해주세요. 알람규칙추가 이전에 일정을 추가할 수 있지만 알람규칙이 적용되지 않습니다.
        \n 더 많은 명령어를 보고 싶으시다면 '/'를 입력해주세요.
        \n 자세한 사항은 반드시 [춘식이봇 문서](https://chunsic-bot.vercel.app/)를 참고해주시면 감사하겠습니다!`
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
