import { Guild, ActionRowBuilder, SelectMenuBuilder } from 'discord.js';
import { channelSelect } from '../selects';
import { Config } from './config';

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function setupSubjectChannels(guild: Guild) {
    let channelGroupIndex = 0;
    // Apparently this deletes all elements with index > 0
    channelSelect.data.length = 0;
    for (const channelGroupId of Config.Instance.Properties
        .SubjectChannelGroupIDs) {
        const channelGroup = guild.channels.cache.get(channelGroupId);
        const categoryChannels = guild.channels.cache.filter(
            (x) => x.parentId === channelGroupId
        );
        if (!channelGroup || !categoryChannels || categoryChannels.size < 1) {
            // we don't have a channel group or it's empty
            console.log(
                `Channel Group ID ${channelGroupId} is either not a group, or is empty`
            );
            continue;
        }
        channelSelect.data.push(
            new ActionRowBuilder<SelectMenuBuilder>().addComponents(
                new SelectMenuBuilder()
                    .setCustomId('channelSelect-' + channelGroupId)
                    .setPlaceholder(channelGroup.name)
                    .setMinValues(1)
            )
        );
        if (categoryChannels) {
            for (const subjectChannel of categoryChannels) {
                let subjectName = subjectChannel[1].name;
                const nameParts = subjectName.split('-');
                subjectName = `${nameParts[0].toUpperCase()} ${nameParts
                    .splice(1)
                    .map(capitalize)
                    .join(' ')}`;
                channelSelect.data[channelGroupIndex].components[0].addOptions([
                    {
                        label: subjectName,
                        value: subjectChannel[1].id,
                    },
                ]);
            }
            channelSelect.data[channelGroupIndex].components[0].setMaxValues(
                Math.min(categoryChannels.size, 25) // 25 is Discord API max
            );
        }
        channelGroupIndex += 1;
    }

    console.log(
        `Subject channels setup succesfully (${channelSelect.data.length} subject channels)`
    );
}