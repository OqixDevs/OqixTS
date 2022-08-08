import { mockDeep, mockReset } from 'jest-mock-extended';
import {
    Collection,
    ChatInputCommandInteraction,
    GuildTextBasedChannel,
    Message,
    ChannelType,
} from 'discord.js';
import { prune } from '../src/commands';

describe('Tests for prune command', () => {
    const interaction = mockDeep<ChatInputCommandInteraction>();
    beforeEach(() => {
        (interaction.channel as GuildTextBasedChannel).bulkDelete = jest.fn(
            () => Promise.resolve(mockDeep<Collection<string, Message>>())
        );
        if (interaction.channel) {
            interaction.channel.type = ChannelType.GuildText;
        }
    });

    afterEach(() => {
        mockReset(interaction);
    });

    it('Calling execute should call reply', () => {
        interaction.options.getInteger.calledWith('amount').mockReturnValue(3);
        prune.execute(interaction);
        expect(
            (interaction.channel as GuildTextBasedChannel).bulkDelete
        ).toHaveBeenCalledTimes(1);
    });
    it('Calling execute with wrong negative int should fail', () => {
        interaction.options.getInteger.calledWith('amount').mockReturnValue(-1);
        prune.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'You need to input a number between 1 and 99.',
            ephemeral: true,
        });
    });
    it('Calling execute with int over 99 should fail', () => {
        interaction.options.getInteger
            .calledWith('amount')
            .mockReturnValue(100);
        prune.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'You need to input a number between 1 and 99.',
            ephemeral: true,
        });
    });
});
