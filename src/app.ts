import {Client, GatewayIntentBits} from 'discord.js';
import {channelListener, interactionListener, pinVoteListener} from './listeners';
import {default as registerCommands} from './registerCommands';
import dotenv from 'dotenv';
import {SubjectChannels} from './utils';

/**
 * Main function which is called when the bot is started.
 * Loads the environment variables, logs in the bot and registers all commands.
 */
export default () => {
    dotenv.config();
    const token = process.env.DISCORD_TOKEN; // add your token here
    console.log('Bot is starting...');
    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
    });
    client.login(token);
    client.once('ready', () => {
        registerCommands();
        client.user?.setActivity(`/verify`, { type: 2 });
        for (const guild of client.guilds.cache) {
            SubjectChannels.setupSubjectChannels(guild[1]);
        }
    });

    interactionListener(client);
    channelListener(client);
    pinVoteListener(client);
};
