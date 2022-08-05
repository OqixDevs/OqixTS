import {
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';
import { channelSelect } from '../selects';
import { setupSubjectChannels } from '../utils';

export const data = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('addChannel')
        .setLabel('Add Channels')
        .setStyle(ButtonStyle.Primary)
);

export async function execute(interaction: ButtonInteraction) {
    if (!interaction.guild) {
        // I don't think this should happen, but apparently guild can be null?
        return;
    }

    if (channelSelect.data.length < 1) {
        setupSubjectChannels(interaction.guild);
        if (channelSelect.data.length < 1) {
            await interaction.reply({
                content:
                    'Failed to fetch subject channels, please contact administrator',
            });
            return;
        }
    }

    interaction.reply({
        content: 'Select channels you want to add or remove below.',
        components: [...channelSelect.data],
        ephemeral: true,
    });
}
