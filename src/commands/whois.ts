import { PermissionFlagsBits } from 'discord-api-types/v9';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

/**
 * Returns available information about user.
 */
export const data = new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Display info about user.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user to show.')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user');

    if (user) {
        return interaction.reply({
            content: `Info about user ${user.username}:
    tag: ${user.tag}
    user ID: ${user.id}`,
            ephemeral: true,
        });
    }
    return interaction.reply({
        content: 'You need to input a user.',
        ephemeral: true,
    });
}
