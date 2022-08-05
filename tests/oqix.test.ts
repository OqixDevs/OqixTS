import { mock } from 'jest-mock-extended';
import { ChatInputCommandInteraction } from 'discord.js';
import { oqix } from '../src/commands';

describe('Tests for oqix command', () => {
    let interaction: ChatInputCommandInteraction;
    beforeEach(() => {
        interaction = mock<ChatInputCommandInteraction>();
    });

    it('Calling execute should call reply', () => {
        oqix.execute(interaction);
        expect(interaction.reply).toHaveBeenCalled;
    });
});
