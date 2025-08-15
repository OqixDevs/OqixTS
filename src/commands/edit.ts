import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    TextBasedChannel,
    MessageFlags,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Embed } from '../utils';

/**
 * Edits existing bot message in a channel.
 */
export const data = new SlashCommandBuilder()
    .setName('edit')
    .setDescription('Edit bots message in a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
        option
            .setName('content')
            .setDescription('New message content')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option.setName('message').setDescription('Message ID').setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('channel')
            .setDescription('Channel ID (defaults to current channel)')
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.member || !interaction.channel) {
        return;
    }

    const channelId = interaction.options.getString('channel')?.trim();
    const messageId = interaction.options.getString('message')?.trim();
    const content = interaction.options.getString('content')?.trim();

    if (!messageId || !content) {
        // this is impossible, all options are set as required
        interaction.reply({
            content: `Some option not specified.`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    let channel: TextBasedChannel;
    if (channelId) {
        const fetchedChannel = interaction.client.channels.cache.get(channelId);
        if (!fetchedChannel || !fetchedChannel.isTextBased()) {
            interaction.reply({
                content: `Channel ID \`${channelId}\` not found or is not a text channel`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        channel = fetchedChannel as TextBasedChannel;
    } else {
        channel = interaction.channel;
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
        interaction.reply({
            content: `Message ID \`${messageId}\` in Channel ID \`${channelId}\` not found.`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (interaction.client.user?.id != message.author.id) {
        interaction.reply({
            content: `Message ID \`${messageId}\` in Channel ID \`${channelId}\` does not belong to the bot!`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (!message.editable) {
        interaction.reply({
            content: `Message ID \`${messageId}\` in Channel ID \`${channelId}\` is not editable.`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const embed = Embed.GetDefault(interaction.member as GuildMember);
    embed.setTitle(`Message edited`);
    const oldContent = message.content ? message.content : '*not available*';
    embed.addFields({
        name: 'Old Content',
        value: oldContent,
    });
    embed.addFields({
        name: 'New Content',
        value: content,
    });

    await message.edit(content);

    await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
    });
}
