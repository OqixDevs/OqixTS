import {
    ChatInputCommandInteraction,
    GuildMemberRoleManager,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';
import { logger } from '../logger';

/**
 * Gives 'graduate' role to the user that already has role 'verified'.
 */

export const data = new SlashCommandBuilder()
    .setName('graduate')
    .setDescription('Identifies user permanently as graduate.')
    .addStringOption((option) =>
        option
            .setName('confirmation')
            .setDescription(
                "Write 'confirm' if you want to set your status to graduate."
            )
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    // Check if interaction.member and interaction.guild is not null
    if (!interaction.member) {
        return interaction.reply({
            content: 'Error: User not recognized.',
            flags: MessageFlags.Ephemeral,
        });
    }
    if (!interaction.guild) {
        return interaction.reply({
            content: 'Error: Server not recognized.',
            flags: MessageFlags.Ephemeral,
        });
    }

    const usersRoles = interaction.member.roles as GuildMemberRoleManager;

    const usersConfirmation = interaction.options.getString('confirmation');
    if (usersConfirmation !== 'confirm') {
        return interaction.reply({
            content:
                'You did not confirm the action to get this role. Read the description again.',
            flags: MessageFlags.Ephemeral,
        });
    }

    await interaction.reply({
        content: 'Processing, wait please...',
        flags: MessageFlags.Ephemeral,
    });

    const isVerified = usersRoles.cache.some(
        (role) => role.name === 'verified'
    );
    const isGraduate = usersRoles.cache.some(
        (role) => role.name === 'graduate'
    );

    if (!isVerified) {
        logger.info(
            `User ${interaction.user.id} tried to get the the role 'graduate, but is not yet even verified.`
        );
        return interaction.editReply({
            content:
                'You are not even a verified member. How dare you! This action was reported.',
        });
    }

    if (isGraduate) {
        logger.info(
            `User ${interaction.user.id} tried to get the the role 'graduate, but already has it.`
        );
        return interaction.editReply({
            content: 'You already have this role.',
        });
    }

    try {
        logger.info(
            `Adding 'graduate' role to the user ${interaction.user.id}.`
        );
        const graduateRole = interaction.guild.roles.cache.find(
            (role) => role.name === 'graduate'
        );
        if (graduateRole) {
            await usersRoles.add(graduateRole);
            return interaction.editReply({
                content: 'Congratulations, you are a graduate now.',
            });
        } else {
            logger.info(`'Graduate' role not found.`);
            return interaction.editReply({
                content: 'Adding role failed. Try again or contact admin.',
            });
        }
    } catch (err) {
        logger.error(
            `Could not add 'graduate' role to the user ${interaction.user.id}.\n${err}`
        );
        return interaction.editReply({
            content: 'Adding role failed. Try again or contact admin.',
        });
    }
}
