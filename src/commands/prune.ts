import {
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v9';

/**
 * Prunes messages in channel.
 */
export const data = new SlashCommandBuilder()
    .setName('prune')
    .setDescription('Prune messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((option) =>
        option
            .setName('amount')
            .setDescription('Number of messages to prune')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('amount');

    if (!amount || !interaction) {
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
        interaction.channel?.type === ChannelType.GuildText ||
        interaction.channel?.type === ChannelType.GuildNews
    ) {
        await interaction.channel
            ?.bulkDelete(amount)
            .then((messages) =>
                interaction.reply({
                    content: `Deleted ${messages.size} messages.`,
                    ephemeral: true,
                })
            )
            .catch((error: unknown) => {
                console.error(error);
                interaction.reply({
                    content:
                        'There was an error trying to prune messages in this channel!',
                    ephemeral: true,
                });
            });
    }

    return interaction.reply({
        content: 'You are in invalid channel',
        ephemeral: true,
    });
}
