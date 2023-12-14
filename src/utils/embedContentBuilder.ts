import { ButtonInteraction } from 'discord.js';
import { Review } from './Review';
import { prisma } from '../model';

export async function embedContentBuilder(
    interaction: ButtonInteraction,
    move: number
) {
    const prevEmbed = interaction.message.embeds[0];
    const reviewId = prevEmbed.footer?.text.split(' ').pop();
    const subjectCode = prevEmbed.title?.replace('Reviews for course ', '');
    const submittedReviews = await prisma.reviews.findMany({
        orderBy: {
            dateReview: 'asc',
        },
        where: {
            subjectCode: subjectCode?.toUpperCase(),
        },
    });
    if (prevEmbed.title == null) {
        return;
    }
    for (let index = 0; index < submittedReviews.length; index++) {
        if (submittedReviews[index].id === reviewId) {
            if (index + move >= submittedReviews.length) {
                index = -1;
            }
            if (index + move < 0) {
                index = submittedReviews.length;
            }
            const reviewer = await interaction.client.users.fetch(
                submittedReviews[index + move].discordUserId
            );
            const review: Review = {
                id: submittedReviews[index + move].id,
                invokedUsername: interaction.user.username,
                invokedAvatarUrl: interaction.user.displayAvatarURL(),
                title: prevEmbed.title,
                description: `\`\`\`${
                    submittedReviews[index + move].reviewText
                }\`\`\``,
                positiveRating: submittedReviews[index + move].positiveRating,
                negativeRating: submittedReviews[index + move].negativeRating,
                reviewerUsername: reviewer.username,
                reviwerAvatarUrl: reviewer.displayAvatarURL(),
                reviewNumber: index + move + 1,
                numberOfReviews: submittedReviews.length,
            };
            return review;
        }
    }
    console.log('Error occured while processing reviews.');
    return undefined;
}
