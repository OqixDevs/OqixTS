/**
 * Listenes for kick or ban actions and adds either a removed or ban value to user status if user is verified
 * also check for ban remove and adds removed value to user status so that user can be verified again
 */

import { Client, GuildBan } from 'discord.js';
import { prisma } from '../model';

export default (client: Client) => {
    client.on('guildBanAdd', async (guildBan: GuildBan) => {
        const user = await prisma.users.findFirst({
            where: {
                discordId: guildBan.user.id,
            },
        });
        if (user) {
            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    status: 'banned',
                },
            });
        }
    });
    client.on('guildBanRemove', async (guildBan: GuildBan) => {
        const user = await prisma.users.findFirst({
            where: {
                discordId: guildBan.user.id,
            },
        });
        if (user) {
            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    status: 'removed',
                },
            });
        }
    });

    client.on('guildMemberRemove', async (member) => {
        const user = await prisma.users.findFirst({
            where: {
                discordId: member.id,
            },
        });
        if (user && user.status !== 'banned') {
            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    status: 'removed',
                },
            });
        }
    });
};
