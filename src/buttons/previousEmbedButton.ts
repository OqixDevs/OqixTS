import { ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';
import { embedContentBuilder } from '../utils/embedContentBuilder';
import { reviewEmbedConstructor } from '../embeds';

export const data = new ButtonBuilder()
    .setCustomId('PreviousReview')
    .setLabel('Previous')
    .setStyle(ButtonStyle.Primary);

export async function execute(interaction: ButtonInteraction) {
    const move = -1;
    const content = await embedContentBuilder(interaction, move);
    if (content == undefined) {
        return interaction.update({
            content: 'Error while processing reviews!',
        });
    }
    const embed = reviewEmbedConstructor(content);
    return interaction.update({
        content: '',
        embeds: [embed],
    });
}
