import { Client } from 'discord.js';
import { sum } from '../commands';
/**
 * Listens for interaction events and calls the appropriate function.
 * @param client The Discord client.
 */
export default (client: Client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'hello') {
            await interaction.reply('Hello there!');
        }
        if (commandName === 'sum') {
            const firstNumber = interaction.options.getString('firstnumber');
            const secondNumber = interaction.options.getString('secondnumber');
            let result = 0;
            if (firstNumber && secondNumber) {
                result = sum(+firstNumber, +secondNumber);
            }
            await interaction.reply(
                `The sum of ${firstNumber} and ${secondNumber} is ${result}`
            );
        }
    });
};
