import { ColorResolvable, GuildMember, MessageEmbed } from 'discord.js';
import { Config } from './config';

export abstract class Embed {
    public static GetDefault(
        member?: GuildMember,
        color?: ColorResolvable | string
    ): MessageEmbed {
        const embed = new MessageEmbed();
        if (member) {
            embed.setFooter({
                text: `Response to ${member.user.tag}`,
                iconURL: member.displayAvatarURL(),
            });
        }
        if (!color) {
            color = Config.Instance.Properties.DefaultColor;
        }
        embed.setColor(color as ColorResolvable);
        embed.setTimestamp();
        return embed;
    }
}
