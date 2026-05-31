import { CommandInteraction } from 'discord.js';
import { prisma } from '../model';
import { logger } from '../logger';

interface Dictionary<T> {
    [Key: string]: T;
}

const programme_roles: { [key: string]: string } = {
    'Artificial intelligence and data processing': 'n-UIZD',
    'Computer systems, communication and security': 'n-PSKB',
    'Computer Systems, Communication and Security (eng)': 'n-PSKB',
    'Informatics for secondary school teachers': 'n-UCI',
    'Software Engineering': 'n-SWE',
    'Software systems and services management': 'n-RSSS',
    'Software Systems and Services Management (eng)': 'n-RSSS',
    'Theoretical computer science': 'n-TEI',
    'Visual informatics': 'n-VIZ',
    'Computer Science': 'd-INF',
    'Computer Science (eng)': 'd-INF',
};

export async function assignRole(
    interaction: CommandInteraction,
    userId: string,
    scrapedConfirmationStudy: Dictionary<string>,
    authorName: string,
    thesisId: string
) {
    const today = new Date();
    const member = interaction.guild?.members.cache.get(userId);
    if (!member) {
        logger.error(`User with ID ${userId} not found in guild.`);
        return undefined;
    }
    logger.info('Assigning role to user.');
    logger.info('Checking study status of user...');
    if (
        scrapedConfirmationStudy[
            'Status of studies as of ' +
                today.getDate() +
                '/' +
                (today.getMonth() + 1) +
                '/' +
                today.getFullYear()
        ] === 'Studies in progress.'
    ) {
        logger.info('Verifying user name in confirmation of study');
        logger.info(
            scrapedConfirmationStudy.Name.replace('Bc. ', '')
                .replace('Mgr. ', '')
                .replace('Ing. ', '')
                .trim()
        );
        logger.info(authorName.trim());
        if (
            scrapedConfirmationStudy.Name.replace('Bc. ', '')
                .replace('Mgr. ', '')
                .replace('Ing. ', '')
                .trim() === authorName.trim()
        ) {
            const roleVerified = interaction.guild?.roles.cache.find(
                (role) => role.name === 'verified'
            );
            const roleProgramm = interaction.guild?.roles.cache.find(
                (role) =>
                    role.name ===
                    programme_roles[scrapedConfirmationStudy['Programme']]
            );
            try {
                logger.info(
                    `Creating user in database with thesis ${thesisId}.`
                );
                await prisma.users.create({
                    data: {
                        discordId: userId,
                        idThesis: thesisId,
                        status: 'verified',
                    },
                });
            } catch (err) {
                logger.error(`Database error: ${err}`);
                return undefined;
            }
            logger.info(`Assigning role to user ${interaction.user.id}.`);
            if (roleVerified && roleProgramm) {
                member.roles.add(roleVerified);
                member.roles.add(roleProgramm);
                return roleProgramm;
            }
        }
    }
    return undefined;
}
