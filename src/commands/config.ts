import {
    APIApplicationCommandOptionChoice,
    PermissionFlagsBits,
} from 'discord-api-types/v9';
import {
    ChatInputCommandInteraction,
    GuildMember,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';
import { Config, ConfigKey, ConfigValue, Embed } from '../utils';

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
    .addSubcommand((subcommand) =>
        subcommand
            .setName('get')
            .setDescription('Get config value')
            .addStringOption((option) =>
                option
                    .setName('property')
                    .setDescription('Config property')
                    .setRequired(true)
                    .setChoices(
                        ...Object.getOwnPropertyNames(
                            Config.Instance.Properties
                        ).map((x) => new StringOption(x))
                    )
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('set')
            .setDescription('Set config value')
            .addStringOption((option) =>
                option
                    .setName('property')
                    .setDescription('Config property')
                    .setRequired(true)
                    .setChoices(
                        ...Object.getOwnPropertyNames(
                            Config.Instance.Properties
                        ).map((x) => new StringOption(x))
                    )
            )
            .addStringOption((option) =>
                option
                    .setName('value')
                    .setDescription(
                        'New config property value. Array values are comma separated'
                    )
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('list').setDescription('List all config values')
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('reload').setDescription('Fully reload config file')
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;

    const property = interaction.options.getString('property');
    const subcommand = interaction.options.getSubcommand();

    const embed = Embed.GetDefault(member);

    if (subcommand == 'get') {
        const value = Config.Instance.GetPropertySerialized(
            property as ConfigKey
        );
        embed.addFields({ name: property ?? 'None', value: value });
        embed.setTitle(`Config property`);
    } else if (subcommand == 'list') {
        const keys = Object.keys(Config.Instance.Properties) as ConfigKey[];
        for (const key of keys) {
            embed.addFields({
                name: key,
                value: Config.Instance.GetPropertySerialized(key),
                inline: true,
            });
        }
        embed.setTitle(`List of config properties`);
    } else if (subcommand == 'set') {
        let newValueRaw = interaction.options.getString('value') ?? 'null';
        const oldValue = Config.Instance.GetPropertySerialized(
            property as ConfigKey
        );
        let newValueArray: Array<string>;
        if (Array.isArray(Config.Instance.Properties[property as ConfigKey])) {
            newValueArray = newValueRaw
                .split(',')
                .filter((x) => x)
                .map((x) => x.trim());
            Config.Instance.SetProperty(
                property as ConfigKey,
                newValueArray as ConfigValue
            );
            newValueRaw = JSON.stringify(newValueArray);
        } else {
            Config.Instance.SetProperty(
                property as ConfigKey,
                newValueRaw as ConfigValue
            );
        }
        embed.setTitle(`Setting property ${property}`);
        embed.addFields({ name: 'Old value', value: oldValue });
        embed.addFields({ name: 'New value', value: newValueRaw });
    } else if (subcommand == 'reload') {
        Config.Instance.LoadConfig();
        embed.setTitle(`Config reloaded`);
    }

    interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
    });
}
