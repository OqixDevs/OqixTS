import { Client, MessageReaction } from 'discord.js';

/**
 * Listens for interaction events and calls the appropriate function.
 * @param client The Discord client.
 */

// Timeout specifying for how long should collector run = 5 Days
const TIMEOUT = 432000000;
// Maximum pin emojis before message is pinned
const MAX_REACTIONS = 3;
// Pin limit set by Discord
const PIN_LIMIT = 50;

export default (client: Client) => {
    client.on('messageCreate', async (message) => {
        try {
            const filter = (reaction: MessageReaction) =>
                reaction.emoji.name === '📌';

            // Set up the collector with the MAX_REACTIONS
            const collector = message.createReactionCollector({
                filter,
                max: MAX_REACTIONS,
                time: TIMEOUT,
            });

            collector.on('end', (_, reason) => {
                // Reactions are no longer collected
                // If the 📌 emoji is clicked the MAX_REACTIONS times
                if (reason === 'limit') {
                    message.channel.messages
                        .fetchPinned()
                        .then((pinnedMessages) => {
                            const size = pinnedMessages.size;
                            // Check if we have not hit the max pin limit
                            try {
                                if (size >= PIN_LIMIT) {
                                    // If yes, unpin the oldest message
                                    pinnedMessages
                                        .at(pinnedMessages.size - 1)
                                        ?.unpin();
                                }
                                message.pin();
                            } catch (error) {
                                console.log('Unable to pin/unpin message:');
                                console.log(error);
                            }
                        });
                }
            });
        } catch (error) {
            console.log(error);
        }
    });
};
