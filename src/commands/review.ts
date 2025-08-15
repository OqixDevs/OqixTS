import {
    ActionRowBuilder,
    ButtonBuilder,
    //ButtonInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';
import { prisma } from '../model';
import { reviewEmbedConstructor } from '../embeds';
import { Dislike, Like, NextReview, PreviousReview } from '../buttons';
import { Review } from '../utils';
import { logger } from '../logger';

/**
 * Edits existing bot message in a channel.
 */
export const data = new SlashCommandBuilder()
    .setName('review')
    .setDescription('Interacts with review feature of the bot')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('get')
            .setDescription('Outputs table with reviews for the subject')
            .addStringOption((option) =>
                option
                    .setName('subject')
                    .setDescription('Code of the subject (e.g. PV276)')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Adds new review for the subjet')
            .addStringOption((option) =>
                option
                    .setName('subject')
                    .setDescription('Code of the subject (e.g. PV276)')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('text')
                    .setDescription('Text of the review')
                    .setRequired(true)
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        content: 'Processing review request...',
        flags: MessageFlags.Ephemeral,
    });
    const subjectCode = interaction.options.getString('subject');
    if (interaction.options.getSubcommand() === 'add') {
        const userId = interaction.user.id;
        const textReview = interaction.options.getString('text');
        if (textReview == undefined || subjectCode == undefined) {
            logger.info('Error with arguments for create review command.');
            return interaction.editReply({
                content: `Error while creating a review for ${subjectCode}.`,
            });
        }
        logger.info(
            `Checking if user ${userId} has already submitted review for ${subjectCode}.`
        );
        const existingReview = await prisma.reviews.findMany({
            where: {
                discordUserId: {
                    equals: userId,
                },
                subjectCode: {
                    equals: subjectCode,
                },
            },
        });
        if (existingReview.length != 0) {
            return interaction.editReply({
                content: `You have already submitted review from subject ${subjectCode}.`,
            });
        }
        try {
            logger.info(`Creating review for subject ${subjectCode}.`);
            await prisma.reviews.create({
                data: {
                    discordUserId: userId,
                    subjectCode: subjectCode.toUpperCase(),
                    reviewText: textReview,
                },
            });
        } catch (err) {
            logger.info(`Database error: ${err}`);
            return interaction.editReply({
                content: `Error while creating a review for ${subjectCode}.`,
            });
        }
        return interaction.editReply({
            content: `Review for subject ${subjectCode} created.`,
        });
    } else if (interaction.options.getSubcommand() === 'get') {
        const submittedReviews = await prisma.reviews.findMany({
            orderBy: {
                dateReview: 'asc',
            },
            where: {
                subjectCode: subjectCode?.toUpperCase(),
            },
        });
        logger.info(
            `Submitted reviews for ${subjectCode}: ${submittedReviews}.`
        );
        if (submittedReviews.length == 0) {
            return interaction.editReply({
                content: `No reviews for ${subjectCode?.toUpperCase()} :(`,
            });
        }
        logger.info(`Building embed for review ${submittedReviews[0].id}.`);
        const title = `Reviews for course ${subjectCode}`;
        const reviewer = await interaction.client.users.fetch(
            submittedReviews[0].discordUserId
        );
        const review: Review = {
            id: submittedReviews[0].id,
            invokedUsername: interaction.user.username,
            invokedAvatarUrl: interaction.user.displayAvatarURL(),
            title: title,
            description: `\`\`\`${submittedReviews[0].reviewText}\`\`\``,
            positiveRating: submittedReviews[0].positiveRating,
            negativeRating: submittedReviews[0].negativeRating,
            reviewerUsername: reviewer.username,
            reviwerAvatarUrl: reviewer.displayAvatarURL(),
            reviewNumber: 1,
            numberOfReviews: submittedReviews.length,
        };
        const reviewEmbed = reviewEmbedConstructor(review);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            PreviousReview.data,
            NextReview.data,
            Like.data,
            Dislike.data
        );
        return interaction.editReply({
            content: '',
            embeds: [reviewEmbed],
            components: [row],
        });
    } else {
        return interaction.editReply({
            content: `Invalid command.`,
        });
    }
}
