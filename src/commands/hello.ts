import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js";
export const data = new SlashCommandBuilder().setName('hello').setDescription('Will say friendly hello');
export async function execute(interaction: CommandInteraction) {
    return interaction.reply('Hello world')
}