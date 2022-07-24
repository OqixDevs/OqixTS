import {
    GuildMember,
    MessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction,
    TextChannel,
} from 'discord.js';
import { openCreateModal } from '../buttons';

export const data: Array<MessageActionRow<MessageSelectMenu>> = [];

export async function execute(interaction: SelectMenuInteraction) {
    if (!interaction.member) {
        return;
    }
    for (const selectedChannelId of interaction.values) {
        const channel =
            interaction.guild?.channels.cache.get(selectedChannelId);
        if (channel) {
            const textChannel = channel as TextChannel;
            const userPermissions = textChannel.permissionsFor(
                interaction.member as GuildMember
            );
            const userCanRead = userPermissions.has('VIEW_CHANNEL');
            if (userCanRead) {
                await textChannel.permissionOverwrites.delete(
                    interaction.member.user.id
                );
            } else {
                await textChannel.permissionOverwrites.create(
                    interaction.member.user.id,
                    {
                        VIEW_CHANNEL: true,
                    }
                );
            }
        }
    }
    await interaction.update({
        components: [...data, openCreateModal.data],
        fetchReply: true,
    });
}
