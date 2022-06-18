import { Client } from 'discord.js';
import { interactionListener } from './listeners';
import { registerCommands } from './commands'
import dotenv from 'dotenv'
/**
 * Main function which is called when the bot is started.
 * Loads the environment variables, logs in the bot and registers all commands.
 */
export default () => {
    dotenv.config()
    const token = process.env.DISCORD_TOKEN; // add your token here
    console.log('Bot is starting...');
    const client = new Client({
        intents: [],
    });
    client.login(token);
    client.once('ready', () => {
        registerCommands();
    })
    interactionListener(client);
};
