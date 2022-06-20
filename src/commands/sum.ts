import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

/**
 * Simple sum command as an example
 */
export const data = new SlashCommandBuilder()
    .setName('sum')
    .setDescription('Gives sum of two number')
    .addStringOption((option) =>
        option
            .setName('firstnumber')
            .setDescription('First number')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('secondnumber')
            .setDescription('Second number')
            .setRequired(true)
    );
export async function execute(interaction: CommandInteraction) {
    const firstNumber = interaction.options.getString('firstnumber');
    const secondNumber = interaction.options.getString('secondnumber');
    let result = 0;
    if (firstNumber && secondNumber) {
        result = +secondNumber + +firstNumber;
    }
    return interaction.reply(`Answer is ${result}`);
}
