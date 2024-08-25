import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('서버정보')
  .setDescription('서버의 정보를 확인합니다.');

export async function execute(interaction) {
  const { guild } = interaction;
  const { name, memberCount, ownerId, createdAt } = guild;

  const owner = await guild.members.fetch(ownerId);

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('서버 정보')
    .addFields(
      { name: '서버 이름', value: name, inline: true },
      { name: '서버 멤버 수', value: `${memberCount}`, inline: true },
      { name: '서버 소유자', value: owner.user.tag, inline: true },
      {
        name: '서버 생성일',
        value: createdAt.toLocaleDateString('ko-KR'),
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter({
      text: '춘식이봇',
      iconURL:
        'https://chunsic-bot.vercel.app/_next/image?url=%2Fchunsic-logo.png&w=48&q=75',
    });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
