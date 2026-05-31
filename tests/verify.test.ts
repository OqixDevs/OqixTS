import { mockDeep } from 'jest-mock-extended';
import {
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    Role,
} from 'discord.js';
import { verify } from '../src/commands';
import * as utils from '../src/utils';
import { prismaMock } from './utils/singletonPrisma';

const baseDict = {
    Student: undefined,
    Name: 'Bc. Josef Novak',
    School: 'Masaryk University',
    Faculty: 'Faculty of Informatics',
    Programme: 'Software Engineering',
    undefined: undefined,
    'Confirmation issue date': '13/7/2021',
    'Status of studies as of 13/7/2022': 'Studies in progress.',
};

const databaseUser = {
    id: '123',
    discordId: '123',
    idThesis: '2223121',
    status: 'verified',
    joinDate: new Date(),
};

const databaseRemovedUser = {
    id: '123',
    discordId: '123',
    idThesis: '2223121',
    status: 'removed',
    joinDate: new Date(),
};

const databaseBannedUser = {
    id: '123',
    discordId: '123',
    idThesis: '2223121',
    status: 'banned',
    joinDate: new Date(),
};

const setupInteraction = () => {
    const interaction = mockDeep<ChatInputCommandInteraction>();
    const guild = mockDeep<Guild>();
    const member = mockDeep<GuildMember>();
    const verifiedRole = { id: 'verified-id', name: 'verified' } as Role;
    const programmeRole = { id: 'programme-id', name: 'n-SWE' } as Role;

    Object.defineProperty(interaction, 'guild', { value: guild });
    Object.defineProperty(interaction.user, 'id', {
        value: '123',
        writable: true,
    });

    interaction.options.getString
        .calledWith('linktoconfirmationmuni')
        .mockReturnValue(
            'https://is.muni.cz/confirmation-of-studies/cccxxd3?lang=en'
        );
    interaction.options.getString
        .calledWith('bachelorthesislink')
        .mockReturnValue('https://dspace.vutbr.cz/handle/11012/2223121');

    guild.members.cache.get.mockReturnValue(member as unknown as GuildMember);
    guild.roles.cache.find.mockImplementation((predicate) => {
        if (predicate(verifiedRole, verifiedRole.id, guild.roles.cache)) {
            return verifiedRole;
        }
        if (predicate(programmeRole, programmeRole.id, guild.roles.cache)) {
            return programmeRole;
        }
        return undefined;
    });

    return { interaction, member, programmeRole, verifiedRole };
};

describe('Tests for verify command', () => {
    let dict: typeof baseDict;
    let nameUser = ' Josef Novak';

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 6, 13));
        dict = { ...baseDict };
        nameUser = ' Josef Novak';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Calling execute should call reply', async () => {
        const { interaction, programmeRole } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);
        prismaMock.users.create.mockResolvedValue(databaseUser);
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'You have been successfully verified with role ' +
                programmeRole.name +
                '.',
        });
    });

    it('Confirmation name is not same as in Dspace', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);
        dict.Name = 'Jan Bazina';
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
        });
    });

    it('Dspace name is not same as on confirmation', async () => {
        const { interaction } = setupInteraction();
        nameUser = 'Jan Bazina';
        prismaMock.users.findMany.mockResolvedValue([]);
        interaction.options.getString
            .calledWith('bachelorthesislink')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/22221');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
        });
    });

    it('Date in system is not correct', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);
        jest.setSystemTime(new Date(2022, 6, 20));
        interaction.options.getString
            .calledWith('bachelorthesislink')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/22221');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
        });
    });

    it('Status of study is not correct', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);
        dict['Status of studies as of 13/7/2022'] = 'Studies not in progress.';
        interaction.options.getString
            .calledWith('bachelorthesislink')
            .mockReturnValue('https://dspace.vutbr.cz/handle/11012/22221');
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
        });
    });

    it('User is already verified', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([databaseUser]);
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'User already verified! Contact admin if you need to verify again.',
        });
    });

    it('Verified user was removed verification should succeed', async () => {
        const { interaction, programmeRole } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([databaseRemovedUser]);
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'You have been successfully verified with role ' +
                programmeRole.name +
                '.',
        });
    });

    it('Verified user was removed new user uses same thesis verification should succeed', async () => {
        const { interaction, programmeRole } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([databaseRemovedUser]);
        interaction.user.id = '1234';
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'You have been successfully verified with role ' +
                programmeRole.name +
                '.',
        });
    });

    it('Verified user was banned verification should fail', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([databaseBannedUser]);
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'User already verified! Contact admin if you need to verify again.',
        });
    });

    it('User is using thesis which is assigned to different user', async () => {
        const { interaction } = setupInteraction();
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
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'This thesis is already used! Please contact admin.',
        });
    });

    it('Both thesis and user is already verified', async () => {
        const { interaction } = setupInteraction();
        interaction.user.id = '123';
        prismaMock.users.findMany.mockResolvedValue([databaseUser]);
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'User already verified! Contact admin if you need to verify again.',
        });
    });

    it('Database error when searching for users', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockRejectedValue(
            new Error('Connection error')
        );
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'Verification failed! Contact admin.',
        });
    });

    it('Database error when creating user', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);
        prismaMock.users.create.mockRejectedValue(
            new Error('Connection error')
        );
        jest.spyOn(utils, 'scrapeThesis').mockReturnValue(
            Promise.resolve(nameUser)
        );
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockReturnValue(
            Promise.resolve(dict)
        );

        await verify.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'Verification failed check if you entered the correct information or contact admin.',
        });
    });
});
