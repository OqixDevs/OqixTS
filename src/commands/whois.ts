import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Display info about user.')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user to show.')
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser('user');

    if (user)
        return interaction.reply({
            content: `Info about user ${user.username}:
    tag: ${user.tag}
    user ID: ${user.id}`,
            ephemeral: true,
        });
}
