import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CommandInteraction } from 'discord.js';
import { uznanipredmetu } from '../src/commands';

describe('Tests for uznanipredmetu command', () => {
    let interaction: DeepMockProxy<CommandInteraction>;
    let fitTotalCredits: number;
    let fitTotalSemesters: number;
    let fiMuniCourseCredits: number;
    beforeEach(() => {
        fitTotalCredits = 186;
        fiMuniCourseCredits = 5;
        fitTotalSemesters = 6;
        interaction = mockDeep<CommandInteraction>();
    });

    it('Calling execute should call reply', () => {
        interaction.options.getInteger
            .calledWith('fimunicoursecredits')
            .mockReturnValue(fiMuniCourseCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalcredits')
            .mockReturnValue(fitTotalCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalsemesters')
            .mockReturnValue(fitTotalSemesters);

        uznanipredmetu.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith(
            `You have studied ${fitTotalSemesters} semesters at FIT. To have a course recognised WITH credits, you need to have finished FIT with extra credits above 180cr.\n\n` +
                `You have finished bachelors with ${fitTotalCredits}cr so you have a total of 6cr available.\n\n` +
                `The course you want to have recognised has ${fiMuniCourseCredits}cr value. Because of your extra credits from bachelors, you can expect to having it recognised for 5cr. But better ask at studies department.`
        );
    });
    it('Calling exactly 180 credits', () => {
        fitTotalCredits = 184;
        interaction.options.getInteger
            .calledWith('fimunicoursecredits')
            .mockReturnValue(fiMuniCourseCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalcredits')
            .mockReturnValue(fitTotalCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalsemesters')
            .mockReturnValue(fitTotalSemesters);

        uznanipredmetu.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith(
            `You have studied ${fitTotalSemesters} semesters at FIT. To have a course recognised WITH credits, you need to have finished FIT with extra credits above 180cr.\n\n` +
                `You have finished bachelors with ${fitTotalCredits}cr so you have a total of 4cr available.\n\n` +
                `The course you want to have recognised has ${fiMuniCourseCredits}cr value. Because of your extra credits from bachelors, you can expect to having it recognised for 4cr. But better ask at studies department.`
        );
    });

    it('Calling exactly 180 credits', () => {
        fitTotalCredits = 180;
        interaction.options.getInteger
            .calledWith('fimunicoursecredits')
            .mockReturnValue(fiMuniCourseCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalcredits')
            .mockReturnValue(fitTotalCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalsemesters')
            .mockReturnValue(fitTotalSemesters);

        uznanipredmetu.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith(
            `You have studied ${fitTotalSemesters} semesters at FIT. To have a course recognised WITH credits, you need to have finished FIT with extra credits above 180cr.\n\n` +
                `You have finished bachelors with ${fitTotalCredits}cr so you have a total of 0cr available.\n\n` +
                `The course you want to have recognised has ${fiMuniCourseCredits}cr value. Because of your extra credits from bachelors, you can expect to having it recognised for 0cr. But better ask at studies department.`
        );
    });

    it('Calling -1 total credits', () => {
        fitTotalCredits = -1;
        interaction.options.getInteger
            .calledWith('fimunicoursecredits')
            .mockReturnValue(fiMuniCourseCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalcredits')
            .mockReturnValue(fitTotalCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalsemesters')
            .mockReturnValue(fitTotalSemesters);

        uznanipredmetu.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'You need to provide positive values.',
            ephemeral: true,
        });
    });

    it('Calling -1 semesters', () => {
        fitTotalSemesters = -1;
        interaction.options.getInteger
            .calledWith('fimunicoursecredits')
            .mockReturnValue(fiMuniCourseCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalcredits')
            .mockReturnValue(fitTotalCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalsemesters')
            .mockReturnValue(fitTotalSemesters);

        uznanipredmetu.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'You need to provide positive values.',
            ephemeral: true,
        });
    });

    it('Calling -1 fi muni course', () => {
        fiMuniCourseCredits = -1;
        interaction.options.getInteger
            .calledWith('fimunicoursecredits')
            .mockReturnValue(fiMuniCourseCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalcredits')
            .mockReturnValue(fitTotalCredits);
        interaction.options.getInteger
            .calledWith('fitvuttotalsemesters')
            .mockReturnValue(fitTotalSemesters);

        uznanipredmetu.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'You need to provide positive values.',
            ephemeral: true,
        });
    });
});
