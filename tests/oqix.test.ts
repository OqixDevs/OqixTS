import { mock } from 'jest-mock-extended';
import { CommandInteraction } from 'discord.js';
import { oqix } from '../src/commands';

describe('Tests for oqix command', () => {
    let interaction: CommandInteraction;
    beforeEach(() => {
        interaction = mock<CommandInteraction>();
    });

    it('Calling execute should call reply', () => {
        oqix.execute(interaction);
        expect(interaction.reply).toHaveBeenCalled;
    });
});
