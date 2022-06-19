import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as commandModules from "./commands"

/**
 * Registers all commands.
 */
type Command = {
    data:  Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
}
export default () => {
    const commands = []

    for (const module of Object.values<Command>(commandModules)){
        commands.push(module.data)
    }

    const token = process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN : '0';
    const guildId = process.env.GUILD_ID ? process.env.GUILD_ID : '0';
    const clientId = process.env.CLIENT_ID ? process.env.CLIENT_ID : '0';
    const rest = new REST({ version: '9' }).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
    })
        .then(() => console.log('Commands registered successfully'))
        .catch(console.error);
};
