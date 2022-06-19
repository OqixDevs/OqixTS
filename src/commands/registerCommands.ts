import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

/**
 * Registers all commands.
 */
export default () => {
    const token = process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN : '0';
    const guildId = process.env.GUILD_ID ? process.env.GUILD_ID : '0';
    const clientId = process.env.CLIENT_ID ? process.env.CLIENT_ID : '0';
    const commands = [
        new SlashCommandBuilder()
            .setName('hello')
            .setDescription('Will say friendly hello'),
        new SlashCommandBuilder()
            .setName('sum')
            .setDescription('Gives sum of two number')
            .addStringOption((option) =>
                option
                    .setName('firstnumber')
                    .setDescription('First number')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('secondnumber')
                    .setDescription('Second number')
                    .setRequired(true)
            ),
    ].map((command) => command.toJSON());
    const rest = new REST({ version: '9' }).setToken(token);
    rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
    })
        .then(() => console.log('Commands registered successfully'))
        .catch(console.error);
};
