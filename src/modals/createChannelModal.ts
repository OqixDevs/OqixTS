import {
    ModalBuilder,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    TextInputBuilder,
    ModalSubmitInteraction,
    TextInputStyle,
} from 'discord.js';

/**
 * Modal for creating new channels
 */
export const data = new ModalBuilder()
    .setCustomId('createChannelModal')
    .setTitle('Create New Channel')
    .addComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            new TextInputBuilder()
                .setCustomId('channelName')
                .setLabel('Channel name')
                .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            new TextInputBuilder()
                .setCustomId('channelDescription')
                .setLabel('Channel description')
                .setStyle(TextInputStyle.Short)
        )
    );
export async function execute(interaction: ModalSubmitInteraction) {
    const channelName = interaction.fields.getTextInputValue('channelName');
    const channelDescription =
        interaction.fields.getTextInputValue('channelDescription');

    // Create new channel, or assign it if user is trying to create existing channel
    console.log({ channelName, channelDescription });

    interaction.reply({
        content: `Created a new channel ${channelName}`,
    });
}
