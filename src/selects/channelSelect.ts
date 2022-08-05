import {
    GuildMember,
    ActionRowBuilder,
    SelectMenuBuilder,
    PermissionsBitField,
    SelectMenuInteraction,
    TextChannel,
} from 'discord.js';

export const data: Array<ActionRowBuilder<SelectMenuBuilder>> = [];

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
            const userCanRead = userPermissions.has(
                PermissionsBitField.Flags.ViewChannel
            );
            if (userCanRead) {
                await textChannel.permissionOverwrites.delete(
                    interaction.member.user.id
                );
            } else {
                await textChannel.permissionOverwrites.create(
                    interaction.member.user.id,
                    {
                        ViewChannel: true,
                        SendMessages: true,
                        SendMessagesInThreads: true,
                    }
                );
            }
        }
    }
    await interaction.update({
        components: [...data],
        fetchReply: true,
    });
}
