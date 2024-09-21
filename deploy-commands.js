import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommandFiles } from './utils/loadCommandFiles.js';

dotenv.config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    const commands = await loadCommandFiles();
    const commandData = commands.map((command) => command.data.toJSON());

    console.log(
      `Started refreshing ${commandData.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commandData }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}
