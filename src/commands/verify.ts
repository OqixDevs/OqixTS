import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { scrapeConfirmationStudies } from '../utils';
import { scrapeThesis } from '../utils';

/**
 * Takes URL to confirmation of studies and thesis and if the data scraped from websites are correct verifies user with role.
 */

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

export const data = new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verifies user')
    .addStringOption((option) =>
        option
            .setName('linktoconfirmationmuni')
            .setDescription(
                'Link to confirmation in E-výpisy (example URL: https://is.muni.cz/confirmation-of-studies/cyweo31r)'
            )
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('bachelorthesislink')
            .setDescription(
                'Thesis link at Dspace (example URL: https://dspace.vutbr.cz/handle/11012/478521)'
            )
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    const idConfirmationMuni = interaction.options.getString(
        'linktoconfirmationmuni'
    );
    const bachelorThesis = interaction.options.getString('bachelorthesislink');
    if (!idConfirmationMuni || !bachelorThesis) {
        return interaction.reply({
            content: 'One of the arguments was not entered!',
            ephemeral: true,
        });
    }
    const bachelorThesisParsedUrl = new URL(sanitizeUrl(bachelorThesis));

    const idConfirmationMuniParsedUrl = new URL(
        sanitizeUrl(idConfirmationMuni)
    );

    const authorName = await scrapeThesis(bachelorThesisParsedUrl.pathname);
    if (!authorName) {
        return interaction.reply({
            content:
                'Could not get the author name. Maybe thesis URL is wrong?',
            ephemeral: true,
        });
    }
    const scrapedConfirmationStudy = await scrapeConfirmationStudies(
        idConfirmationMuniParsedUrl.pathname
    );
    if (!scrapedConfirmationStudy) {
        return interaction.reply({
            content:
                'Could not get infromation from the confirmation of studies. Maybe confirmation of studies URL is wrong?',
            ephemeral: true,
        });
    }
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
            if (roleVerified && roleProgramm) {
                member.roles.add(roleVerified);
                member.roles.add(roleProgramm);
                return interaction.reply({
                    content:
                        'You have been successfully verified with role ' +
                        roleProgramm.name +
                        '.',
                    ephemeral: true,
                });
            }
        }
    }
    return interaction.reply({
        content:
            'Verification failed check if you entered the correct information or contact admin.',
        ephemeral: true,
    });
}
