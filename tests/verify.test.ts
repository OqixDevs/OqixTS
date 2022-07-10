import { mockDeep } from 'jest-mock-extended';
import { CommandInteraction, Role } from 'discord.js';
import { verify } from '../src/commands';
import * as utils from '../src/utils';
import * as fs from 'fs';

const dict = {
    Student: undefined,
    Name: 'Bc. Josef Novak',
    School: 'Masaryk University',
    Faculty: 'Faculty of Informatics',
    Programme: 'Software Engineering',
    undefined: undefined,
    'Confirmation issue date': '13/7/2021',
    'Status of studies as of 13/7/2022': 'Studies in progress.',
};
let nameUser = ' Josef Novak';

describe('Tests for verify command', () => {
    const interaction = mockDeep<CommandInteraction>();
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 6, 13));
        fs.writeFileSync('./userLog.json', JSON.stringify([]));
    });

    afterEach(() => {
        try {
            fs.unlinkSync('./userLog.json');
        } catch (e) {
            console.log('Could not delete userLog.json - ignoring');
        }
    });

    it('Calling execute should call reply', async () => {
        interaction.user.id = '123';
        interaction.options.getString
            .calledWith('linktoconfirmationmuni')
            .mockReturnValue(
                'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
            );
        interaction.options.getString
            .calledWith('bachelorthesislink')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/2223121');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );
        if (interaction.guild) {
            interaction.guild.roles.cache.find.mockReturnValue(
                'test' as unknown as Role
            );
        }
        await verify.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'You have been successfully verified with role undefined.',
            ephemeral: true,
        });
    });

    it('Confirmation name is not same as in Dspace', async () => {
        dict.Name = 'Jan Bazina';
        interaction.user.id = '123';
        interaction.options.getString
            .calledWith('idconfirmationmuni')
            .mockReturnValue(
                'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
            );
        interaction.options.getString
            .calledWith('bachelorthesis')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/2223121');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );
        if (interaction.guild) {
            interaction.guild.roles.cache.find.mockReturnValue(
                'test' as unknown as Role
            );
        }
        await verify.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'You have been successfully verified with role undefined.', //This name has to be here because of the mock
            ephemeral: true,
        });
    });

    it('Dspace name is not same as on confirmation', async () => {
        nameUser = 'Jan Bazina';
        interaction.user.id = '123';
        interaction.options.getString
            .calledWith('idconfirmationmuni')
            .mockReturnValue(
                'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
            );
        interaction.options.getString
            .calledWith('bachelorthesis')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/22221');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );
        if (interaction.guild) {
            interaction.guild.roles.cache.find.mockReturnValue(
                'test' as unknown as Role
            );
        }
        await verify.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
            ephemeral: true,
        });
    });
    it('Date in system is not correct', async () => {
        jest.setSystemTime(new Date(2022, 6, 20));
        interaction.user.id = '123';
        interaction.options.getString
            .calledWith('idconfirmationmuni')
            .mockReturnValue(
                'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
            );
        interaction.options.getString
            .calledWith('bachelorthesis')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/22221');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );
        if (interaction.guild) {
            interaction.guild.roles.cache.find.mockReturnValue(
                'test' as unknown as Role
            );
        }
        await verify.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
            ephemeral: true,
        });
    });
    it('Status of study is not correct', async () => {
        dict['Status of studies as of 13/7/2022'] = 'Studies not in progress.';
        interaction.user.id = '123';
        interaction.options.getString
            .calledWith('idconfirmationmuni')
            .mockReturnValue(
                'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
            );
        interaction.options.getString
            .calledWith('bachelorthesis')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/22221');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );
        if (interaction.guild) {
            interaction.guild.roles.cache.find.mockReturnValue(
                'test' as unknown as Role
            );
        }
        await verify.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
            ephemeral: true,
        });
    });

    it('userLog file does not exist test should not fail', async () => {
        interaction.user.id = '123';
        fs.unlinkSync('./userLog.json');
        interaction.options.getString
            .calledWith('linktoconfirmationmuni')
            .mockReturnValue(
                'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
            );
        interaction.options.getString
            .calledWith('bachelorthesislink')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/2223121');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );
        if (interaction.guild) {
            interaction.guild.roles.cache.find.mockReturnValue(
                'test' as unknown as Role
            );
        }
        await verify.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'You have been successfully verified with role undefined.',
            ephemeral: true,
        });
    });

    it('User is already verified', async () => {
        interaction.user.id = '123';
        let userLog = undefined;
        try {
            userLog = fs.readFileSync('./userLog.json', 'utf8');
        } catch (e) {
            fs.writeFileSync('./userLog.json', '[]');
            userLog = fs.readFileSync('./userLog.json', 'utf8');
        }
        const userLogJSON = JSON.parse(userLog);
        userLogJSON.push({
            id: '123',
            idThesis: '222321',
            status: 'verified',
        });
        fs.writeFileSync('./userLog.json', JSON.stringify(userLogJSON));
        interaction.options.getString
            .calledWith('linktoconfirmationmuni')
            .mockReturnValue(
                'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
            );
        interaction.options.getString
            .calledWith('bachelorthesislink')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/2223121');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );
        if (interaction.guild) {
            interaction.guild.roles.cache.find.mockReturnValue(
                'test' as unknown as Role
            );
        }
        await verify.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content:
                'User already verified! Contact admin if you need to verify again.',
            ephemeral: true,
        });
    });

    it('User is using thesis which is assigned to different user', async () => {
        interaction.user.id = '123';
        let userLog = undefined;
        try {
            userLog = fs.readFileSync('./userLog.json', 'utf8');
        } catch (e) {
            fs.writeFileSync('./userLog.json', '[]');
            userLog = fs.readFileSync('./userLog.json', 'utf8');
        }
        const userLogJSON = JSON.parse(userLog);
        userLogJSON.push({
            id: '1234',
            idThesis: '2223121',
            status: 'verified',
        });
        fs.writeFileSync('./userLog.json', JSON.stringify(userLogJSON));
        interaction.options.getString
            .calledWith('linktoconfirmationmuni')
            .mockReturnValue(
                'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
            );
        interaction.options.getString
            .calledWith('bachelorthesislink')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/2223121');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );
        if (interaction.guild) {
            interaction.guild.roles.cache.find.mockReturnValue(
                'test' as unknown as Role
            );
        }
        await verify.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'This thesis is already used! Please contact admin.',
            ephemeral: true,
        });
    });

    it('Both thesis and user is already verified', async () => {
        interaction.user.id = '123';
        let userLog = undefined;
        try {
            userLog = fs.readFileSync('./userLog.json', 'utf8');
        } catch (e) {
            fs.writeFileSync('./userLog.json', '[]');
            userLog = fs.readFileSync('./userLog.json', 'utf8');
        }
        const userLogJSON = JSON.parse(userLog);
        userLogJSON.push({
            id: '123',
            idThesis: '2223121',
            status: 'verified',
        });
        fs.writeFileSync('./userLog.json', JSON.stringify(userLogJSON));
        interaction.options.getString
            .calledWith('linktoconfirmationmuni')
            .mockReturnValue(
                'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
            );
        interaction.options.getString
            .calledWith('bachelorthesislink')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/2223121');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );
        if (interaction.guild) {
            interaction.guild.roles.cache.find.mockReturnValue(
                'test' as unknown as Role
            );
        }
        await verify.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content:
                'User already verified! Contact admin if you need to verify again.',
            ephemeral: true,
        });
    });
});
