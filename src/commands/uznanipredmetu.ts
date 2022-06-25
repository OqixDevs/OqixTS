import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

/**
 * Tells user if he gets credits from FIT course at FI.
 */
export const data = new SlashCommandBuilder()
    .setName('uznanipredmetu')
    .setDescription(
        'Tells how many credits you get if you recoginze FIT VUT course at FI MUNI.'
    )
    .addIntegerOption((option) =>
        option
            .setName('fimunicoursecredits')
            .setDescription('Number of credits of FI MUNI course.')
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName('fitvuttotalcredits')
            .setDescription('Total credits you got from bachelor studies.')
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName('fitvuttotalsemesters')
            .setDescription('Number of semester you studied bachelors at FIT.')
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    const fiCourseCredits = interaction.options.getInteger(
        'fimunicoursecredits'
    );
    const fitTotalCredits =
        interaction.options.getInteger('fitvuttotalcredits');
    const fitTotalSemesters = interaction.options.getInteger(
        'fitvuttotalsemesters'
    );

    if (!fiCourseCredits || !fitTotalCredits || !fitTotalSemesters) {
        return interaction.reply({
            content: 'You need to input a positive integer.',
            ephemeral: true,
        });
    }

    if (fiCourseCredits < 0 || fitTotalCredits < 0 || fitTotalSemesters < 0) {
        return interaction.reply({
            content: 'You need to provide positive values.',
            ephemeral: true,
        });
    }
    const neededCredits = 30 * fitTotalSemesters;
    let availableCredits = fitTotalCredits - neededCredits;
    availableCredits <= 0 ? (availableCredits = 0) : availableCredits;

    let expect = 0;
    availableCredits <= fiCourseCredits
        ? (expect = availableCredits)
        : (expect = fiCourseCredits);
    expect < 0 ? (expect = 0) : expect;

    return interaction.reply(
        `You have studied ${fitTotalSemesters} semesters at FIT. To have a course recognised WITH credits, you need to have finished FIT with extra credits above ${neededCredits}cr.\n\n` +
            `You have finished bachelors with ${fitTotalCredits}cr so you have a total of ${availableCredits}cr available.\n\n` +
            `The course you want to have recognised has ${fiCourseCredits}cr value. Because of your extra credits from bachelors, you can expect to having it recognised for ${expect}cr. But better ask at studies department.`
    );
}
