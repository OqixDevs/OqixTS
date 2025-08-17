import {
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    MessageFlags,
} from 'discord.js';
import { channelSelect } from '../selects';

/**
 * Setups button for adding channels
 */
export const data = new ActionRowBuilder<ButtonBuilder>().addComponents();

export async function execute(interaction: ButtonInteraction) {
    if (!interaction.guild) {
        // I don't think this should happen, but apparently guild can be null?
        return;
    }

    const groupId = interaction.customId.substring(
        interaction.customId.indexOf('-') + 1
    );
    const subjectSelect = channelSelect.data.find((x) => x.id == groupId);

    if (!subjectSelect) {
        interaction.reply({
            content: 'Could not find select with ID ' + groupId,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    interaction.reply({
        content: 'Select channels you want to add or remove below.',
        components: [...subjectSelect.data],
        flags: MessageFlags.Ephemeral,
    });
}
