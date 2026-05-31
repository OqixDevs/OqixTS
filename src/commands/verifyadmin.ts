import { PermissionFlagsBits } from 'discord-api-types/v9';
import {
    CacheType,
    ChatInputCommandInteraction,
    ContainerBuilder,
    GuildMember,
    MessageFlags,
    MessageReaction,
    SlashCommandBuilder,
    TextChannel,
    User,
} from 'discord.js';
import { logger } from '../logger';
import { prisma } from '../model';
import { scrapeConfirmationStudies, assignRole } from '../utils';
import { sanitizeUrl } from '@braintree/sanitize-url';

async function checkUserVerificationStatus(
    userDiscordId: string,
    interaction: ChatInputCommandInteraction
): Promise<boolean> {
    try {
        const user = await prisma.users.findMany({
            where: {
                discordId: userDiscordId,
            },
        });
        if (user.length != 0 && user[0].status !== 'removed') {
            await interaction.editReply({
                content: 'User already verified!',
            });
            return true;
        }
        return false;
    } catch (err) {
        logger.error(`Database error: ${err}`);
        await interaction.editReply({
            content: 'Verification failed! Database error.',
        });
        return true;
    }
}

function createInfoContainer(
    interaction: ChatInputCommandInteraction<CacheType>,
    targetUser: GuildMember,
    linkToConfirmationMuni: string,
    bachelorThesisLink: string,
    additionalInfo: string | null
) {
    return new ContainerBuilder()
        .setAccentColor(0x3498db)
        .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
                `Admin <@${interaction.user.id}> wants to verify manually user <@${targetUser.id}>. Vote with ✅ and ❌`
            )
        )
        .addSeparatorComponents((separator) => separator)
        .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
                `MUNI confirmation link: ${linkToConfirmationMuni}`
            )
        )
        .addSeparatorComponents((separator) => separator)
        .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(`Thesis link: ${bachelorThesisLink}`)
        )
        .addSeparatorComponents((separator) => separator)
        .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(`Additional info:\n ${additionalInfo}`)
        );
}

export const data = new SlashCommandBuilder()
    .setName('verifyadmin')
    .setDescription('Verification of users done by admin')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
        option
            .setName('linktoconfirmationmuni')
            .setDescription(
                'Link to confirmation in E-výpisy (example URL: https://is.muni.cz/confirmation-of-studies/cyweo31r)'
            )
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('bachelorthesislink')
            .setDescription(
                'Thesis link at Dspace (example URL: https://dspace.vutbr.cz/handle/cby7-11b-4d4-9f79f-d98bee82)'
            )
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('userid')
            .setDescription(
                'ID of the user to verify (example: 123456789012345678)'
            )
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('additionalinfo')
            .setDescription(
                'Additional information - what school, why verification is not possible'
            )
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('username')
            .setDescription(
                'Name of the user to verify (example Jan Novák), required if user is not verified manually'
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const allowedChannels =
        process.env.GUILD_ALLOWED_CHANNELS?.split(',').map((id) => id.trim()) ||
        [];
    if (!interaction.guild) {
        return;
    }
    if (!allowedChannels.includes(interaction.channelId)) {
        return interaction.editReply({
            content:
                'This command cannot be used in this channel. Only #admin-chat is allowed',
        });
    }

    const linkToConfirmationMuni = interaction.options.getString(
        'linktoconfirmationmuni'
    );
    const bachelorThesisLink =
        interaction.options.getString('bachelorthesislink');
    const userId = interaction.options.getString('userid');
    if (!linkToConfirmationMuni || !bachelorThesisLink || !userId) {
        return interaction.editReply({
            content: 'One of the arguments was not entered!',
        });
    }
    const additionalInfo = interaction.options.getString('additionalinfo');
    let targetUser = undefined;
    targetUser = await interaction.guild.members.fetch(userId);
    if (targetUser === undefined) {
        return interaction.editReply({
            content: 'User not found in the server. Please check the user ID.',
        });
    }
    const verifyContainer = createInfoContainer(
        interaction,
        targetUser,
        linkToConfirmationMuni,
        bachelorThesisLink,
        additionalInfo
    );

    if (await checkUserVerificationStatus(userId, interaction)) {
        return;
    }

    const channel = interaction.channel as TextChannel;
    if (!channel) {
        return interaction.editReply({
            content: 'Channel not found.',
        });
    }
    const message = await channel.send({
        components: [verifyContainer],
        flags: MessageFlags.IsComponentsV2,
    });
    const agreeEmoji = '✅';
    const disagreeEmoji = '❌';
    await message.react(agreeEmoji);
    await message.react(disagreeEmoji);

    const initialCounts: Record<string, number> = {
        [agreeEmoji]: message.reactions.cache.get(agreeEmoji)?.count ?? 1,
        [disagreeEmoji]: message.reactions.cache.get(disagreeEmoji)?.count ?? 1,
    };
    const TIME_LIMIT = 4 * 24 * 60 * 60 * 1000; // 96 hours in milliseconds

    const filter = (reaction: MessageReaction, user: User) => {
        if (user.bot) return false;
        return (
            reaction.emoji.name === agreeEmoji ||
            reaction.emoji.name === disagreeEmoji
        );
    };

    const collector = message.createReactionCollector({
        filter,
        time: TIME_LIMIT,
    });
    // Gather at least 2 separate votes from different users
    collector.on('collect', async (reaction: MessageReaction) => {
        try {
            const emojiName = reaction.emoji.name;
            const totalVotes = reaction.count;
            const additionalVotes = totalVotes - initialCounts[emojiName!];
            if (additionalVotes >= 1) {
                collector.stop();
                if (emojiName === disagreeEmoji) {
                    return message.reply(
                        'Verification of the user has been rejected by other admins. User has not been added to database.'
                    );
                }
                if (
                    await checkUserVerificationStatus(
                        interaction.user.id,
                        interaction
                    )
                ) {
                    return;
                }

                logger.info(
                    `Adding user to db user ${targetUser.id} with thesis ${bachelorThesisLink}.`
                );
                logger.info(
                    targetUser.roles.cache.some(
                        (role) => role.name === 'verified'
                    )
                );
                if (
                    targetUser.roles.cache.some(
                        (role) => role.name === 'verified'
                    )
                ) {
                    try {
                        await prisma.users.create({
                            data: {
                                discordId: targetUser.id,
                                idThesis: bachelorThesisLink,
                                status: 'verified',
                            },
                        });
                        logger.info(
                            `User ${targetUser.id} added to database with thesis ${bachelorThesisLink}.`
                        );
                    } catch (err) {
                        logger.error(`Database error: ${err}`);
                        return message.reply(
                            'Creating user in database failed!'
                        );
                    }
                    return message.reply('User has been added to database!');
                } else {
                    const userName = interaction.options.getString('username');
                    if (!userName) {
                        return message.reply(
                            'Name of the user is required if user is not verified manually!'
                        );
                    }
                    const idConfirmationMuniParsedUrl = new URL(
                        sanitizeUrl(linkToConfirmationMuni)
                    );
                    const scrapedConfirmationStudy =
                        await scrapeConfirmationStudies(
                            idConfirmationMuniParsedUrl.pathname
                        );
                    if (!scrapedConfirmationStudy) {
                        return interaction.editReply({
                            content:
                                'Could not get information from the confirmation of studies. Maybe confirmation of studies URL is wrong or the website did not respond.',
                        });
                    }

                    const roleProgramm = await assignRole(
                        interaction,
                        targetUser.id,
                        scrapedConfirmationStudy,
                        userName,
                        bachelorThesisLink
                    );
                    logger.info(
                        `Assigned role ${roleProgramm?.name} to user ${targetUser.id}.`
                    );
                    return message.reply(
                        'User has been added to database and verified!'
                    );
                }
            }
        } catch (error) {
            return message.reply(
                `An error occurred while processing the votes. Please try again. ${error}`
            );
        }
        return;
    });
    return interaction.editReply({
        content:
            'Manual verification process started. Waiting for votes from other admins.',
    });
}
