import {
    GuildMember,
    ActionRowBuilder,
    SelectMenuBuilder,
    PermissionsBitField,
    SelectMenuInteraction,
    TextChannel,
} from 'discord.js';

export type SelectID = {
    id: string;
    data: Array<ActionRowBuilder<SelectMenuBuilder>>;
};

/**
 * Select menu for assigning channels to users
 */
export const data: Array<SelectID> = [];

export async function execute(interaction: SelectMenuInteraction) {
    if (!interaction.member) {
        return;
    }
    await interaction.deferUpdate();
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

    const groupId = interaction.customId.substring(
        interaction.customId.lastIndexOf('-') + 1
    );

    const select = data.find((x) => x.id == groupId);
    if (!select || !select.data) {
        return;
    }

    await interaction.editReply({
        components: [...select.data],
    });
}
