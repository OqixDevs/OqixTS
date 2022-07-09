import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { assignRole, scrapeConfirmationStudies } from '../utils';
import { scrapeThesis } from '../utils';
import * as fs from 'fs';

/**
 * Takes URL to confirmation of studies and thesis and if the data scraped from websites are correct verifies user with role.
 */

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
    let userLog = undefined;
    try {
        userLog = fs.readFileSync('./userLog.json', 'utf8');
    } catch (e) {
        fs.writeFileSync('./userLog.json', '[]');
        userLog = fs.readFileSync('./userLog.json', 'utf8');
    }
    const userLogJSON = JSON.parse(userLog);
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
    for (const key in userLogJSON) {
        if (
            userLogJSON[key].idConfirmationMuni ===
                idConfirmationMuniParsedUrl.pathname.split('/')[2] &&
            interaction.user.id === userLogJSON[key].id
        ) {
            return interaction.reply({
                content:
                    'User already verified! Contact admin if you need to verify again.',
                ephemeral: true,
            });
        } else if (
            userLogJSON[key].idConfirmationMuni ===
            idConfirmationMuniParsedUrl.pathname.split('/')[2]
        ) {
            return interaction.reply({
                content:
                    'This confirmation of studies is already used! please use different one.',
                ephemeral: true,
            });
        }
    }
    const authorName = await scrapeThesis(bachelorThesisParsedUrl.pathname);
    if (!authorName) {
        return interaction.reply({
            content:
                'Could not get the author name. Maybe thesis URL is wrong or the website did not respond.',
            ephemeral: true,
        });
    }
    const scrapedConfirmationStudy = await scrapeConfirmationStudies(
        idConfirmationMuniParsedUrl.pathname
    );
    if (!scrapedConfirmationStudy) {
        return interaction.reply({
            content:
                'Could not get infromation from the confirmation of studies. Maybe confirmation of studies URL is wrong or the website did not respond.',
            ephemeral: true,
        });
    }

    const roleProgramm = await assignRole(
        interaction,
        scrapedConfirmationStudy,
        authorName,
        idConfirmationMuniParsedUrl
    );
    if (roleProgramm) {
        return interaction.reply({
            content:
                'You have been successfully verified with role ' +
                roleProgramm +
                '.',
            ephemeral: true,
        });
    }
    return interaction.reply({
        content:
            'Verification failed check if you entered the correct information or contact admin.',
        ephemeral: true,
    });
}
