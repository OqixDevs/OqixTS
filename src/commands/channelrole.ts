import { PermissionFlagsBits } from 'discord-api-types/v9';
import {
    ChatInputCommandInteraction,
    GuildMemberRoleManager,
    MessageFlags,
    NonThreadGuildBasedChannel,
    SlashCommandBuilder,
} from 'discord.js';
import { Config } from '../utils';

export const data = new SlashCommandBuilder()
    .setName('channelrole')
    .setDescription('Add or remove channel role')
    .addSubcommand((sub) =>
        sub.setName('add').setDescription('Add corresponding channel role')
    )
    .addSubcommand((sub) =>
        sub
            .setName('remove')
            .setDescription('Remove corresponding channel role')
    )
    .addSubcommand((sub) =>
        sub
            .setName('create')
            .setDescription('Create corresponding channel role')
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guild = interaction.guild;
    const config = Config.Instance.Properties;
    if (
        !interaction.channel?.isThread() &&
        !config.SubjectChannelGroupIDs.includes(
            (interaction.channel as NonThreadGuildBasedChannel).parentId ?? '-1'
        )
    ) {
        await interaction.reply({
            content: `This channel has no special role`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const channelName = (interaction.channel as NonThreadGuildBasedChannel)
        .name;
    const subjectCode = channelName
        .substring(0, channelName.indexOf('-'))
        .toUpperCase();
    const subjectRole = guild?.roles.cache.find((r) => r.name == subjectCode);
    const roleManager = interaction.member?.roles as GuildMemberRoleManager;
    let action = '';
    if (subcommand == 'add' && subjectRole) {
        action = 'Added';
        await roleManager.member.roles.add(subjectRole);
    } else if (subcommand == 'remove' && subjectRole) {
        action = 'Removed';
        await roleManager.member.roles.remove(subjectRole);
    } else if (subcommand == 'create') {
        const parentId =
            (interaction.channel as NonThreadGuildBasedChannel)?.parentId ??
            '-1';
        const canCreate =
            interaction.memberPermissions?.has(
                PermissionFlagsBits.ManageRoles
            ) && config.SubjectChannelGroupIDs.includes(parentId);
        if (!canCreate) {
            await interaction.reply({
                content: `You cannot create roles in this channel`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (!subjectRole) {
            await interaction.guild?.roles.create({
                mentionable: true,
                name: `${subjectCode}`,
                hoist: false,
            });

            await interaction.reply({
                content: `\`${subjectCode}\` role created`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        } else {
            await interaction.reply({
                content: `\`${subjectCode}\` role already exists`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
    } else {
        await interaction.reply({
            content: `This channel has no special role`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await interaction.reply({
        content: `${action} role \`${subjectCode}\``,
        flags: MessageFlags.Ephemeral,
    });
}
