import { SlashCommandBuilder } from '@discordjs/builders';
import {
    APIApplicationCommandOptionChoice,
    PermissionFlagsBits,
} from 'discord-api-types/v9';
import { CommandInteraction, GuildMember } from 'discord.js';
import { Config, ConfigKey } from '../utils/config';
import { Embed } from '../utils/embed';

class StringOption implements APIApplicationCommandOptionChoice<string> {
    value: string;
    name: string;

    constructor(val: string) {
        this.value = val;
        this.name = val;
    }
}

export const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Gets or sets config values')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
        option
            .setChoices(
                {
                    name: 'get',
                    value: 'get',
                },
                {
                    name: 'set',
                    value: 'set',
                },
                {
                    name: 'list',
                    value: 'list',
                }
            )
            .setName('action')
            .setDescription('Command config action')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('property')
            .setDescription('Config property')
            .setRequired(false)
            .setChoices(
                ...Object.getOwnPropertyNames(Config.Instance.Properties).map(
                    (x) => new StringOption(x)
                )
            )
    )
    .addStringOption((option) =>
        option
            .setName('value')
            .setDescription('New config value, if setting property')
    );

export async function execute(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;

    const action = interaction.options.getString('action');
    const property = interaction.options.getString('property');

    const embed = Embed.GetDefault(member);

    if (action == 'get') {
        const value = Config.Instance.GetProperty(property as ConfigKey);
        embed.addField(property ?? 'None', value);
    } else if (action == 'list') {
        const keys = Object.keys(Config.Instance) as ConfigKey[];
        for (const key of keys) {
            embed.addField(key, Config.Instance.Properties[key], true);
        }
    } else if (action == 'set') {
        const newValue = interaction.options.getString('value') ?? 'None';
        const oldValue = Config.Instance.GetProperty(property as ConfigKey);
        Config.Instance.SetProperty(property as ConfigKey, newValue);
        embed.setTitle(`Setting property ${property}`);
        embed.addField('Old value', oldValue);
        embed.addField('New value', newValue);
    }

    interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}
