import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readyEvent from './events/ready.js';
import { deployCommands } from './deploy-commands.js';
import guildDelete from './events/guildDelete.js';
import interactionCreate from './events/interactionCreate.js';
import guildCreate from './events/guildCreate.js';
import { loadCommandFiles } from './utils/loadCommandFiles.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

async function loadCommands() {
  try {
    const commands = await loadCommandFiles();
    for (const command of commands) {
      client.commands.set(command.data.name, command);
    }
    console.log(`Loaded ${client.commands.size} commands.`);
  } catch (error) {
    console.error('Error loading commands:', error);
  }
}

client.once(readyEvent.name, async () => {
  await readyEvent.execute(client);
  await deployCommands();
});

client.on(interactionCreate.name, (...args) =>
  interactionCreate.execute(...args, client)
);
client.on(guildCreate.name, (...args) => guildCreate.execute(...args));
client.on(guildDelete.name, (...args) => guildDelete.execute(...args));

client.login(process.env.DISCORD_TOKEN);

loadCommands();
