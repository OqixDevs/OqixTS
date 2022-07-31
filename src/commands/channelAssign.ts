import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { CommandInteraction } from 'discord.js';
import { addChannel } from '../buttons';

export const data = new SlashCommandBuilder()
    .setName('channelmanagement')
    .setDescription('Setup user channel management')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
    interaction.reply({
        components: [addChannel.data],
    });
}
