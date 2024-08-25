import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('유저정보')
  .setDescription('유저의 정보를 확인합니다.')
  .addUserOption((option) =>
    option
      .setName('유저')
      .setDescription('정보를 확인할 유저를 선택하세요.')
      .setRequired(true)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser('유저');
  const member = await interaction.guild.members.fetch(user.id);

  const roles =
    member.roles.cache
      .filter((role) => role.name !== '@everyone')
      .map((role) => role.name)
      .join(', ') || '역할 없음';

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(`${user.username}님의 정보`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: '유저 태그', value: user.tag, inline: true },
      { name: '닉네임', value: member.nickname || '없음', inline: true },
      { name: '역할', value: roles, inline: true },
      {
        name: '상태',
        value: member.presence?.status || '오프라인',
        inline: true,
      },
      {
        name: '서버 가입일',
        value: member.joinedAt.toLocaleDateString('ko-KR'),
        inline: true,
      },
      {
        name: '계정 생성일',
        value: user.createdAt.toLocaleDateString('ko-KR'),
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
