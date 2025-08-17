import { PermissionFlagsBits } from 'discord-api-types/v9';
import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';
import { addChannel } from '../buttons';
import { Config } from '../utils';

export const data = new SlashCommandBuilder()
    .setName('channelmanagement')
    .setDescription('Setup user channel management')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
        return;
    }

    if (Config.Instance.Properties.SubjectChannelGroupIDs.length > 5) {
        interaction.reply({
            content: 'Attempting to set up with more than 5 channel categories',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (addChannel.data.components.length < 1) {
        interaction.reply({
            content: 'No channels have been set up',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    interaction.reply({
        components: [addChannel.data],
    });
}
