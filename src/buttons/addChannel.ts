import { ButtonInteraction, MessageActionRow, MessageButton } from 'discord.js';
import { channelSelect } from '../selects';
import { setupSubjectChannels } from '../utils';

export const data = new MessageActionRow<MessageButton>().addComponents(
    new MessageButton()
        .setCustomId('addChannel')
        .setLabel('Add Channels')
        .setStyle('PRIMARY')
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
                    'Failed to fetch subject channels, please contant administrator',
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
