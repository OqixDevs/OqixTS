import {
    ChatInputCommandInteraction,
    GuildMemberRoleManager,
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
            ephemeral: true,
        });
        return;
    }

    let action = '';
    const channelName = (interaction.channel as NonThreadGuildBasedChannel)
        .name;
    const subjectCode = channelName
        .substring(0, channelName.indexOf('-'))
        .toUpperCase();
    const subjectRole = guild?.roles.cache.find((r) => r.name == subjectCode);

    if (!subjectRole) {
        await interaction.reply({
            content: `This channel has no special role`,
            ephemeral: true,
        });
        return;
    }

    const roleManager = interaction.member?.roles as GuildMemberRoleManager;
    if (subcommand == 'add') {
        action = 'Added';
        await roleManager.member.roles.add(subjectRole);
    } else {
        action = 'Removed';
        await roleManager.member.roles.remove(subjectRole);
    }

    await interaction.reply({
        content: `${action} role ${subjectCode}`,
        ephemeral: true,
    });
}
