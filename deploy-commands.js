const { REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, CLIENT_ID } = process.env;
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands/utility'))
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/utility/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // 기존 커맨드 삭제
    const currentCommands = await rest.get(
      Routes.applicationCommands(CLIENT_ID)
    );

    for (const command of currentCommands) {
      await rest.delete(Routes.applicationCommand(CLIENT_ID, command.id));
    }

    // 새로운 커맨드 등록
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
