import { ButtonInteraction, MessageActionRow, MessageButton } from 'discord.js';
import { createChannelModal } from '../modals';

export const data = new MessageActionRow<MessageButton>().addComponents(
    new MessageButton()
        .setCustomId('openCreateModal')
        .setLabel('Create New Channel')
        .setStyle('PRIMARY')
);

export async function execute(interaction: ButtonInteraction) {
    await interaction.showModal(createChannelModal.data);
}
