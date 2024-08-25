import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('투표하기')
  .setDescription('투표를 생성합니다.')
  .addStringOption((option) =>
    option
      .setName('질문')
      .setDescription('투표 질문을 입력하세요.')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('옵션1')
      .setDescription('첫 번째 투표 옵션을 입력하세요.')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('옵션2')
      .setDescription('두 번째 투표 옵션을 입력하세요.')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('옵션3')
      .setDescription('세 번째 투표 옵션을 입력하세요.')
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName('옵션4')
      .setDescription('네 번째 투표 옵션을 입력하세요.')
      .setRequired(false)
  );

export async function execute(interaction) {
  const question = interaction.options.getString('질문');
  const options = [
    interaction.options.getString('옵션1'),
    interaction.options.getString('옵션2'),
    interaction.options.getString('옵션3'),
    interaction.options.getString('옵션4'),
  ].filter(Boolean);

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('📊 투표')
    .setDescription(question)
    .setTimestamp()
    .setFooter({
      text: '춘식이봇',
      iconURL:
        'https://chunsic-bot.vercel.app/_next/image?url=%2Fchunsic-logo.png&w=48&q=75',
    });

  options.forEach((option, index) => {
    embed.addFields({
      name: `옵션 ${index + 1}`,
      value: option,
      inline: true,
    });
  });

  const message = await interaction.reply({
    embeds: [embed],
    fetchReply: true,
  });

  const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
  for (let i = 0; i < options.length; i++) {
    await message.react(reactions[i]);
  }
}
