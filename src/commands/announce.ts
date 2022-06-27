import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v9';

/**
 * Makes an announcement into a channel.
 */
export const data = new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Announces a message to a channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
        option
            .setName('message')
            .setDescription('Your message to be announced.')
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    const message = interaction.options.getString('message');

    if (!message) {
        return interaction.reply({
            content: 'You need to input a message.',
            ephemeral: true,
        });
    }

    if (message.length > 2000) {
        return interaction.reply({
            content: 'Message is too long.',
            ephemeral: true,
        });
    }

    return interaction.channel
        ?.send(message)
        .then(() =>
            interaction.reply({ content: 'Message sent', ephemeral: true })
        )
        .catch((error: unknown) => {
            console.error(error);
            interaction.reply({
                content:
                    'There was an error trying to announce in this channel!',
                ephemeral: true,
            });
        });
}
