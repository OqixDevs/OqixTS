import { ButtonInteraction, MessageActionRow, MessageButton } from 'discord.js';
import { channelSelect } from '../selects';

export const data = new MessageActionRow<MessageButton>().addComponents(
    new MessageButton()
        .setCustomId('addChannel')
        .setLabel('Add Channels')
        .setStyle('PRIMARY')
);

export async function execute(interaction: ButtonInteraction) {
    interaction.reply({
        content: 'Select channels you want to add or remove below.',
        components: [...channelSelect.data],
        ephemeral: true,
    });
}
