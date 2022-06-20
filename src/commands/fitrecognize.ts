import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

/**
 * Tells user if he gets credits from FIT course at FI.
 */
export const data = new SlashCommandBuilder()
    .setName('fitrecognize')
    .setDescription(
        'Tells how many credits you get if you recoginze FIT VUT course at FI MUNI.'
    )
    .addNumberOption((option) =>
        option
            .setName('fimunicoursecredits')
            .setDescription('Number of credits of FI MUNI course.')
            .setRequired(true)
    )
    .addNumberOption((option) =>
        option
            .setName('fitvuttotalcredits')
            .setDescription('Total credits you got from bachelor studies.')
            .setRequired(true)
    )
    .addNumberOption((option) =>
        option
            .setName('fitvuttotalsemesters')
            .setDescription('Number of semester you studied bachelors at FIT.')
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    const fiCourseCredits = interaction.options.getNumber(
        'fimunicoursecredits'
    );
    const fitTotalCredits = interaction.options.getNumber('fitvuttotalcredits');
    const fitTotalSemesters = interaction.options.getNumber(
        'fitvuttotalsemesters'
    );

    if (
        fiCourseCredits == null ||
        fitTotalCredits == null ||
        fitTotalSemesters == null
    ) {
        return interaction.reply({
            content: 'You need to input a positive integer.',
            ephemeral: true,
        });
    }

    const neededCredits = 30 * fitTotalSemesters;
    let availableCredits = fitTotalCredits - neededCredits;
    availableCredits < 0 ? (availableCredits = 0) : availableCredits;

    let expect = 0;
    availableCredits < fiCourseCredits
        ? (expect = availableCredits)
        : (expect = availableCredits - fiCourseCredits);
    expect < 0 ? (expect = 0) : expect;
    expect > fiCourseCredits ? (expect = fiCourseCredits) : expect;

    return interaction.reply(
        `You've studied ${fitTotalSemesters} semesters at FIT, therefore you need more than ${neededCredits}cr to recognize any course WITH credits. You've finished bachelors with ${fitTotalCredits}cr so you have available total of ${availableCredits}cr to use from bachelors. Expect to receive ${expect}cr if you recognize that FIT course at FI with value of ${fiCourseCredits}cr, but better ask at studies department.`
    );
}
