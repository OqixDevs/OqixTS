import { mockDeep } from 'jest-mock-extended';
import { ChatInputCommandInteraction, Role } from 'discord.js';
import { verify } from '../src/commands';
import * as utils from '../src/utils';
import { prismaMock } from './utils/singletonPrisma';

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

const databaseUser = {
    id: '123',
    discordId: '123',
    idThesis: '2223121',
    status: 'verified',
    joinDate: new Date(),
};

describe('Tests for verify command', () => {
    const interaction = mockDeep<ChatInputCommandInteraction>();
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 6, 13));
    });

    it('Calling execute should call reply', async () => {
        prismaMock.users.findMany.mockResolvedValue([]);
        prismaMock.users.create.mockResolvedValue(databaseUser);
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'You have been successfully verified with role undefined.',
        });
    });

    it('Confirmation name is not same as in Dspace', async () => {
        prismaMock.users.findMany.mockResolvedValue([]);
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
        });
    });

    it('Dspace name is not same as on confirmation', async () => {
        nameUser = 'Jan Bazina';
        interaction.user.id = '123';
        prismaMock.users.findMany.mockResolvedValue([]);
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
        });
    });
    it('Date in system is not correct', async () => {
        prismaMock.users.findMany.mockResolvedValue([]);
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
        });
    });
    it('Status of study is not correct', async () => {
        prismaMock.users.findMany.mockResolvedValue([]);
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
        });
    });

    it('User is already verified', async () => {
        prismaMock.users.findMany.mockResolvedValue([databaseUser]);
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'User already verified! Contact admin if you need to verify again.',
        });
    });

    it('User is using thesis which is assigned to different user', async () => {
        interaction.user.id = '123';
        prismaMock.users.findMany
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                {
                    id: '1234',
                    discordId: '1234',
                    idThesis: '2223121',
                    status: 'verified',
                    joinDate: new Date(),
                },
            ]);
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'This thesis is already used! Please contact admin.',
        });
    });

    it('Both thesis and user is already verified', async () => {
        interaction.user.id = '123';
        prismaMock.users.findMany.mockResolvedValue([databaseUser]);
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'User already verified! Contact admin if you need to verify again.',
        });
    });

    it('Database error when searching for users', async () => {
        prismaMock.users.findMany.mockRejectedValue(
            new Error('Connection error')
        );
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'Verification failed! Contact admin.',
        });
    });

    it('Database error when creating user', async () => {
        prismaMock.users.findMany.mockResolvedValue([]);
        prismaMock.users.create.mockRejectedValue(
            new Error('Connection error')
        );
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
        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'Verification failed! Contact admin.',
        });
    });
});
