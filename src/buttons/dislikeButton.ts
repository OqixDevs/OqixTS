import { ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';
import { prisma } from '../model';

export const data = new ButtonBuilder()
    .setCustomId('Dislike')
    .setLabel('👎')
    .setStyle(ButtonStyle.Primary);

export async function execute(interaction: ButtonInteraction) {
    const prevEmbed = interaction.message.embeds[0];
    const reviewId = prevEmbed.footer?.text.split(' ').pop();
    await prisma.reviews.update({
        where: {
            id: reviewId,
        },
        data: {
            negativeRating: {
                increment: 1,
            },
        },
    });
    return interaction.update({
        content: 'Thank you for your vote',
    });
}
