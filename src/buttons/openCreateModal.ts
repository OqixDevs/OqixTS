import {
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';
import { createChannelModal } from '../modals';

export const data = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('openCreateModal')
        .setLabel('Create New Channel')
        .setStyle(ButtonStyle.Primary)
);

export async function execute(interaction: ButtonInteraction) {
    await interaction.showModal(createChannelModal.data);
}
