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
                const customId = parseCustomId(interaction.customId);
                await buttons[customId].execute(interaction);
            } else if (interaction.isSelectMenu()) {
                const customId = parseCustomId(interaction.customId);
                await selects[customId].execute(interaction);
            } else if (interaction.isModalSubmit()) {
                const customId = parseCustomId(interaction.customId);
                await modals[customId].execute(interaction);
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

function parseCustomId(customId: string) {
    const slashIndex = customId.indexOf('-');
    if (slashIndex > -1) {
        customId = customId.substring(0, customId.indexOf('-'));
    }
    return customId;
}
