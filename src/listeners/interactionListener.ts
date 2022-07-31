import { Client } from 'discord.js';
import * as commandsModule from '.././commands';
import * as buttonsModule from '.././buttons';
import * as selectsModule from '.././selects';
import * as modalsModule from '.././modals';
/**
 * Listens for interaction events and calls the appropriate function.
 * @param client The Discord client.
 */
export default (client: Client) => {
    client.on('interactionCreate', async (interaction) => {
        const commands = Object(commandsModule);
        const buttons = Object(buttonsModule);
        const selects = Object(selectsModule);
        const modals = Object(modalsModule);
        try {
            if (interaction.isCommand()) {
                await commands[interaction.commandName].execute(interaction);
            } else if (interaction.isButton()) {
                await buttons[interaction.customId].execute(interaction);
            } else if (interaction.isSelectMenu()) {
                const selectName = interaction.customId.substring(
                    0,
                    interaction.customId.indexOf('-')
                );
                await selects[selectName].execute(interaction);
            } else if (interaction.isModalSubmit()) {
                await modals[interaction.customId].execute(interaction);
            }
        } catch (error) {
            console.error(error);
            if (interaction.isRepliable()) {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true,
                });
            }
        }
    });
};
