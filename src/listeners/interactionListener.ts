import { Client } from 'discord.js';
import * as commandsModule from ".././commands"
/**
 * Listens for interaction events and calls the appropriate function.
 * @param client The Discord client.
 */
export default (client: Client) => {
    client.on('interactionCreate', async (interaction) => {
        const commands = Object(commandsModule)
        if (!interaction.isCommand()) return;
        try {
            await commands[interaction.commandName].execute(interaction)
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });
};
