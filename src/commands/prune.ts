import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

/**
 * Prunes messages in channel.
 */
export const data = new SlashCommandBuilder()
    .setName('prune')
    .setDescription('Prune messages')
    .addIntegerOption((option) =>
        option
            .setName('amount')
            .setDescription('Number of messages to prune')
            .setRequired(true)
    );

//TODO: Only for admin
export async function execute(interaction: CommandInteraction) {
    const amount = interaction.options.getInteger('amount');

    if (amount == null || interaction == null) {
        return interaction.reply({
            content:
                'There was an error trying to export data from your command.',
            ephemeral: true,
        });
    }

    if (amount < 1 || amount > 99) {
        return interaction.reply({
            content: 'You need to input a number between 1 and 99.',
            ephemeral: true,
        });
    }

    if (
        interaction.channel?.type === 'GUILD_TEXT' ||
        interaction.channel?.type === 'GUILD_NEWS'
    ) {
        //TODO: Works but tells that bot is not responding.
        await interaction.channel
            ?.bulkDelete(amount)
            .catch((error: unknown) => {
                console.error(error);
                interaction.reply({
                    content:
                        'There was an error trying to prune messages in this channel!',
                    ephemeral: true,
                });
            });
    }
}
