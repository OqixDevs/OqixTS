import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Guild,
    SelectMenuBuilder,
} from 'discord.js';
import { addChannel } from '../buttons';
import { channelSelect } from '../selects';
import { SelectID } from '../selects/channelSelect';
import { Config } from './config';

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function setupPlaceholder(
    select: ActionRowBuilder<SelectMenuBuilder>,
    lastItemIndex: number
) {
    const firstLabel = select.components[0].options[0].data.label;
    const lastLabel =
        select.components[0].options[lastItemIndex - 1].data.label;

    const firstCode = firstLabel?.split(' ')[0];
    const lastCode = lastLabel?.split(' ')[0];

    select.components[0].setPlaceholder(`${firstCode} - ${lastCode}`);
    select.components[0].setMaxValues(lastItemIndex);
}

export type ChannelGroups = {
    group: {
        id: string;
        name: string;
    };
    channels: Array<{
        id: string;
        name: string;
    }>;
};
export class SubjectChannels {
    static async setupSubjectChannels(guild: Guild) {
        channelSelect.data.length = 0;
        addChannel.data.components.length = 0;

        const maxItemIndex = 24;
        let selectIndex = 0;

        for (const channelGroupId of Config.Instance.Properties
            .SubjectChannelGroupIDs) {
            const subjectGroup = guild.channels.cache.get(channelGroupId);
            const categoryChannels = guild.channels.cache.filter(
                (x) => x.parentId === channelGroupId
            );

            if (
                !subjectGroup ||
                !categoryChannels ||
                categoryChannels.size < 1
            ) {
                // we don't have a channel group or it's empty
                console.log(
                    `Channel Group ID ${channelGroupId} is either not a group, or is empty`
                );
                continue;
            }

            const channelsArray = Array.from(categoryChannels);
            const sortedChannels = channelsArray.sort(
                (a, b) =>
                    a[1].name.localeCompare(b[1].name) -
                    b[1].name.localeCompare(a[1].name)
            );

            addChannel.data.components.push(
                new ButtonBuilder()
                    .setCustomId('addChannel-' + subjectGroup.id)
                    .setLabel(subjectGroup.name)
                    .setStyle(ButtonStyle.Primary)
            );

            const select: SelectID = {
                id: subjectGroup.id,
                data: [],
            };
            let selectRow =
                new ActionRowBuilder<SelectMenuBuilder>().addComponents(
                    new SelectMenuBuilder()
                        .setCustomId(
                            `channelSelect-${selectIndex}-${subjectGroup.id}`
                        )
                        .setMinValues(1)
                );

            select.data.push(selectRow);
            channelSelect.data.push(select);

            let channelIndex = 0;
            for (const subjectChannel of sortedChannels) {
                let subjectName = subjectChannel[1].name;
                const nameParts = subjectName.split('-');
                if (nameParts.length > 0) {
                    subjectName = `${nameParts[0].toUpperCase()} ${nameParts
                        .splice(1)
                        .map(capitalize)
                        .join(' ')}`;
                } else {
                    subjectName = capitalize(subjectName);
                }

                if (channelIndex > 0 && channelIndex % maxItemIndex == 0) {
                    setupPlaceholder(selectRow, maxItemIndex);
                    ++selectIndex;
                    selectRow =
                        new ActionRowBuilder<SelectMenuBuilder>().addComponents(
                            new SelectMenuBuilder()
                                .setCustomId(
                                    `channelSelect-${selectIndex}-${subjectGroup.id}`
                                )
                                .setMinValues(1)
                        );
                    select.data.push(selectRow);
                }

                selectRow.components[0].addOptions([
                    {
                        value: subjectChannel[1].id,
                        label: subjectName,
                    },
                ]);

                ++channelIndex;
            }

            setupPlaceholder(selectRow, channelIndex % maxItemIndex);
        }
    }
}
