import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('oqix')
    .setDescription('Will say friendly hello');
export async function execute(interaction: CommandInteraction) {
    return interaction.reply("Hey homie, what's up?");
}
