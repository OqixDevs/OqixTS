import { PermissionFlagsBits } from 'discord-api-types/v9';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { addChannel } from '../buttons';

export const data = new SlashCommandBuilder()
    .setName('channelmanagement')
    .setDescription('Setup user channel management')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
        return;
    }
    if (addChannel.data.components.length < 1) {
        interaction.reply({
            content: 'No channels have been set up',
            ephemeral: true,
        });
        return;
    }

    interaction.reply({
        components: [addChannel.data],
    });
}
