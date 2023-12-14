import { EmbedBuilder } from 'discord.js';
import { Review } from '../utils';

export function reviewEmbedConstructor(reviewInfo: Review) {
    const reviewEmbed = new EmbedBuilder()
        .setColor('#2f00ff')
        .setTitle(reviewInfo.title)
        .setAuthor({
            name: reviewInfo.invokedUsername,
            iconURL: reviewInfo.invokedAvatarUrl,
        })
        .setDescription(reviewInfo.description)
        .addFields({
            name: 'Rating of the review',
            value: `${reviewInfo.positiveRating}👍|${reviewInfo.negativeRating}👎`,
        })
        .setTimestamp()
        .setFooter({
            text: `Reviwer: ${reviewInfo.reviewerUsername} · Review number: ${reviewInfo.reviewNumber}/${reviewInfo.numberOfReviews} · ID: ${reviewInfo.id}`,
            iconURL: reviewInfo.reviwerAvatarUrl,
        });

    return reviewEmbed;
}
