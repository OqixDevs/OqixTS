import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('whoami')
    .setDescription('Display info about yourself.');

//TODO: add user attributes from database (name, surname, specialisation, date of verification)
export async function execute(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;

    return interaction.reply({
        content: `Info about user ${interaction.user.username}:
    tag: ${interaction.user.tag}
    user ID: ${interaction.user.id}
    joined on: ${member.joinedAt?.getDate().toString()}/${member.joinedAt
            ?.getMonth()
            .toString()}/${member.joinedAt?.getFullYear().toString()}`,
        ephemeral: true,
    });
}
