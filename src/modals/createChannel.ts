import {
    Modal,
    MessageActionRow,
    ModalActionRowComponent,
    TextInputComponent,
    ModalSubmitInteraction,
} from 'discord.js';

export const data = new Modal()
    .setCustomId('createChannelModal')
    .setTitle('Create New Channel')
    .addComponents(
        new MessageActionRow<ModalActionRowComponent>().addComponents(
            new TextInputComponent()
                .setCustomId('channelName')
                .setLabel('Channel name')
                .setStyle('SHORT')
        ),
        new MessageActionRow<ModalActionRowComponent>().addComponents(
            new TextInputComponent()
                .setCustomId('channelDescription')
                .setLabel('Channel description')
                .setStyle('SHORT')
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
