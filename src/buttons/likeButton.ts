import { ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';
import { prisma } from '../model';

export const data = new ButtonBuilder()
    .setCustomId('Like')
    .setLabel('👍')
    .setStyle(ButtonStyle.Primary);

export async function execute(interaction: ButtonInteraction) {
    const prevEmbed = interaction.message.embeds[0];
    const reviewId = prevEmbed.footer?.text.split(' ').pop();
    await prisma.reviews.update({
        where: {
            id: reviewId,
        },
        data: {
            positiveRating: {
                increment: 1,
            },
        },
    });
    return interaction.update({
        content: 'Thank you for your vote',
    });
}
