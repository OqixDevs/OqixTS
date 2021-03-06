import { Client } from 'discord.js';
import { interactionListener } from './listeners';
import { default as registerCommands } from './registerCommands';
import dotenv from 'dotenv';
/**
 * Main function which is called when the bot is started.
 * Loads the environment variables, logs in the bot and registers all commands.
 */
export default () => {
    dotenv.config();
    const token = process.env.DISCORD_TOKEN; // add your token here
    console.log('Bot is starting...');
    const client = new Client({
        intents: ['GUILDS', 'GUILD_MESSAGES'],
    });
    client.login(token);
    client.once('ready', () => {
        registerCommands();
        client.user?.setActivity(`/verify`, { type: 2 });
    });

    interactionListener(client);
};
