import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadCommandFiles() {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const commands = [];
        const commandsPath = path.join(__dirname, '..', 'commands');
        const commandFiles = fs
          .readdirSync(commandsPath)
          .filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
          const filePath = `file://${path.join(commandsPath, file)}`;
          const command = await import(filePath);
          if ('data' in command && 'execute' in command) {
            commands.push(command);
          } else {
            console.log(
              `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
          }
        }

        resolve(commands);
      } catch (error) {
        reject(error);
      }
    })();
  });
}
