import { mockDeep } from 'jest-mock-extended';
import {
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    Message,
    MessageReaction,
    Role,
    TextChannel,
} from 'discord.js';
import { verifyadmin } from '../src/commands';
import * as utils from '../src/utils';
import { prismaMock } from './utils/singletonPrisma';

const confirmationData = {
    Name: 'Bc. Josef Novak',
    Programme: 'Software Engineering',
    'Status of studies as of 13/7/2022': 'Studies in progress.',
};

const createCollector = () => {
    const handlers: Array<(reaction: MessageReaction) => Promise<void> | void> =
        [];
    const collector = {
        on: jest.fn(
            (
                event: string,
                handler: (reaction: MessageReaction) => Promise<void> | void
            ) => {
                if (event === 'collect') {
                    handlers.push(handler);
                }
            }
        ),
        stop: jest.fn(),
    };
    return { collector, handlers };
};

const setupInteraction = () => {
    const interaction = mockDeep<ChatInputCommandInteraction>();
    const guild = mockDeep<Guild>();
    const channel = mockDeep<TextChannel>();
    const message = mockDeep<Message<true>>();
    const targetUser = mockDeep<GuildMember>();

    Object.defineProperty(interaction, 'guild', { value: guild });
    Object.defineProperty(interaction, 'channel', {
        value: channel,
        writable: true,
    });
    Object.defineProperty(interaction, 'channelId', {
        value: 'allowed-channel',
        writable: true,
    });
    Object.defineProperty(interaction.user, 'id', { value: 'admin-id' });

    interaction.options.getString
        .calledWith('linktoconfirmationmuni')
        .mockReturnValue(
            'https://is.muni.cz/confirmation-of-studies/abc?lang=en'
        );
    interaction.options.getString
        .calledWith('bachelorthesislink')
        .mockReturnValue('https://dspace.vutbr.cz/handle/11012/2223121');
    interaction.options.getString
        .calledWith('userid')
        .mockReturnValue('target-id');
    interaction.options.getString
        .calledWith('additionalinfo')
        .mockReturnValue('Some info');
    interaction.options.getString
        .calledWith('username')
        .mockReturnValue('Jan Novak');

    Object.defineProperty(targetUser, 'id', { value: 'target-id' });
    targetUser.roles.cache.some.mockReturnValue(true);
    guild.members.fetch.mockResolvedValue(targetUser as unknown as never);

    channel.send.mockResolvedValue(message as unknown as Message<true>);
    message.react.mockResolvedValue({} as MessageReaction);
    message.reply.mockResolvedValue(message as unknown as Message<true>);
    message.reactions.cache.get.mockReturnValue({
        count: 1,
    } as MessageReaction);

    const { collector, handlers } = createCollector();
    message.createReactionCollector.mockReturnValue(collector as never);

    return { interaction, targetUser, message, handlers, collector, channel };
};

describe('Tests for verifyadmin command', () => {
    beforeEach(() => {
        process.env.GUILD_ALLOWED_CHANNELS = 'allowed-channel';
        jest.clearAllMocks();
    });

    it('Replies when used in disallowed channel', async () => {
        const { interaction } = setupInteraction();
        interaction.channelId = 'other-channel';

        await verifyadmin.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content:
                'This command cannot be used in this channel. Only #admin-chat is allowed',
        });
    });

    it('Replies when required arguments are missing', async () => {
        const { interaction } = setupInteraction();
        interaction.options.getString
            .calledWith('linktoconfirmationmuni')
            .mockReturnValue(null);

        await verifyadmin.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'One of the arguments was not entered!',
        });
    });

    it('Replies when admin user is already verified', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([
            {
                id: '1',
                discordId: 'admin-id',
                idThesis: '111',
                status: 'verified',
                joinDate: new Date(),
            },
        ]);

        await verifyadmin.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'User already verified!',
        });
    });

    it('Replies when database lookup fails', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockRejectedValue(
            new Error('Connection error')
        );

        await verifyadmin.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'Verification failed! Database error.',
        });
    });

    it('Replies when channel is missing', async () => {
        const { interaction } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);
        Object.defineProperty(interaction, 'channel', {
            value: null,
        });

        await verifyadmin.execute(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'Channel not found.',
        });
    });

    it('Rejects verification when admins vote no', async () => {
        const { interaction, handlers, message } = setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);

        await verifyadmin.execute(interaction);

        const reaction = {
            emoji: { name: '❌' },
            count: 3,
        } as MessageReaction;
        await handlers[0](reaction);

        expect(message.reply).toHaveBeenCalledWith(
            'Verification of the user has been rejected by other admins. User has not been added to database.'
        );
    });

    it('Creates user in database when verified role is present', async () => {
        const { interaction, handlers, message, targetUser } =
            setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);
        prismaMock.users.create.mockResolvedValue({
            id: '123',
            discordId: targetUser.id,
            idThesis: 'https://dspace.vutbr.cz/handle/11012/2223121',
            status: 'verified',
            joinDate: new Date(),
        });

        await verifyadmin.execute(interaction);

        const reaction = {
            emoji: { name: '✅' },
            count: 3,
        } as MessageReaction;
        await handlers[0](reaction);

        expect(prismaMock.users.create).toHaveBeenCalledWith({
            data: {
                discordId: targetUser.id,
                idThesis: 'https://dspace.vutbr.cz/handle/11012/2223121',
                status: 'verified',
            },
        });
        expect(message.reply).toHaveBeenCalledWith(
            'User has been added to database!'
        );
    });

    it('Assigns role when user is not already verified', async () => {
        const { interaction, handlers, message, targetUser } =
            setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);
        targetUser.roles.cache.some.mockReturnValue(false);
        jest.spyOn(utils, 'scrapeConfirmationStudies').mockResolvedValue(
            confirmationData
        );
        const role = { name: 'n-SWE' } as Role;
        jest.spyOn(utils, 'assignRole').mockResolvedValue(role);

        await verifyadmin.execute(interaction);

        const reaction = {
            emoji: { name: '✅' },
            count: 3,
        } as MessageReaction;
        await handlers[0](reaction);

        expect(utils.assignRole).toHaveBeenCalledWith(
            interaction,
            targetUser.id,
            confirmationData,
            'Jan Novak',
            'https://dspace.vutbr.cz/handle/11012/2223121'
        );
        expect(message.reply).toHaveBeenCalledWith(
            'User has been added to database and verified!'
        );
    });

    it('Requires username when user is not verified manually', async () => {
        const { interaction, handlers, message, targetUser } =
            setupInteraction();
        prismaMock.users.findMany.mockResolvedValue([]);
        targetUser.roles.cache.some.mockReturnValue(false);
        interaction.options.getString
            .calledWith('username')
            .mockReturnValue(null);

        await verifyadmin.execute(interaction);

        const reaction = {
            emoji: { name: '✅' },
            count: 3,
        } as MessageReaction;
        await handlers[0](reaction);

        expect(message.reply).toHaveBeenCalledWith(
            'Name of the user is required if user is not verified manually!'
        );
    });
});
