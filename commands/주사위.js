import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('주사위')
  .setDescription('1부터 100 사이의 랜덤 숫자를 뽑습니다.');

export async function execute(interaction) {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  await interaction.reply(`🎲 주사위 결과: ${randomNumber}`);
}
