import { Client } from 'discord.js';
import { Config, SubjectChannels } from '../utils';
/**
 * Listens for channel events and calls the appropriate function.
 * @param client The Discord client.
 */
export default (client: Client) => {
    client.on('channelCreate', async (channel) => {
        const guild = await client.guilds.fetch(channel.guildId);
        const config = Config.Instance.Properties;
        // processing subject channel creation
        if (config.SubjectChannelGroupIDs.includes(channel?.parentId ?? '-1')) {
            // Add to subject selector
            await SubjectChannels.setupSubjectChannels(guild);

            // Notify of creation
            if (
                config.NewChannelNotificationEnabled &&
                config.NewChannelNotificationChannel
            ) {
                const notifyChannel = await client.channels.fetch(
                    config.NewChannelNotificationChannel
                );
                if (notifyChannel?.isSendable()) {
                    await notifyChannel.send({
                        content: `New course channel created \`#${channel.name}\``,
                    });
                }
            }

            // Create mentionable subject role
            const subjectCode = channel.name
                .substring(0, channel.name.indexOf('-'))
                .toUpperCase();
            await guild.roles.create({
                mentionable: true,
                name: `${subjectCode}`,
                hoist: false,
            });
        }
    });
};
