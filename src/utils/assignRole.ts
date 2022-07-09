import { CommandInteraction, GuildMember } from 'discord.js';
import * as fs from 'fs';

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
    scrapedConfirmationStudy: Dictionary<string>,
    authorName: string,
    idConfirmationMuniParsedUrl: URL
) {
    let userLog = undefined;
    try {
        userLog = fs.readFileSync('./userLog.json', 'utf8');
    } catch (e) {
        fs.writeFileSync('./userLog.json', '[]');
        userLog = fs.readFileSync('./userLog.json', 'utf8');
    }
    const userLogJSON = JSON.parse(userLog);
    const today = new Date();
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
            const member = interaction.member as GuildMember;
            userLogJSON.push({
                id: interaction.user.id,
                idConfirmationMuni:
                    idConfirmationMuniParsedUrl.pathname.split('/')[2],
                status: 'verified',
            });
            fs.writeFileSync('./userLog.json', JSON.stringify(userLogJSON));
            if (roleVerified && roleProgramm) {
                member.roles.add(roleVerified);
                member.roles.add(roleProgramm);
                return roleProgramm;
            }
        }
    }
    return undefined;
}
