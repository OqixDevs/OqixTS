import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { CommandInteraction } from 'discord.js';

/**
 * Resetarts bot
 */
export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Will restart bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
    return interaction
        .reply('Restarting bot...')
        .then(() => interaction.client.destroy())
        .then(() => interaction.client.login(process.env.DISCORD_TOKEN))
        .then(() => interaction.channel?.send('Bot successfully restarted!'));
}
