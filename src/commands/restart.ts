import { PermissionFlagsBits } from 'discord-api-types/v9';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SubjectChannels } from '../utils';

/**
 * Resetarts bot
 */
export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Will restart bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
    return interaction
        .reply('Restarting bot...')
        .then(() => interaction.client.destroy())
        .then(() => interaction.client.login(process.env.DISCORD_TOKEN))
        .then(() => {
            for (const guild of interaction.client.guilds.cache) {
                SubjectChannels.setupSubjectChannels(guild[1]);
            }
            if (interaction.channel?.isSendable()) {
                interaction.channel?.send('Bot successfully restarted!');
            }
        });
}
