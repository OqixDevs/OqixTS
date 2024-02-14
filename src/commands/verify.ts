import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { assignRole, scrapeConfirmationStudies, scrapeThesis } from '../utils';
import { prisma } from '../model';

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

export async function execute(interaction: ChatInputCommandInteraction) {
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

    await interaction.reply({
        content: 'Verifying, wait please...',
        ephemeral: true,
    });
    let user;
    try {
        user = await prisma.users.findMany({
            where: {
                discordId: interaction.user.id,
            },
        });
    } catch (err) {
        console.log(`Database error: ${err}`);
        return interaction.editReply({
            content: 'Verification failed! Contact admin.',
        });
    }
    if (user.length != 0 && user[0].status !== 'removed') {
        return interaction.editReply({
            content:
                'User already verified! Contact admin if you need to verify again.',
        });
    }
    try {
        let thesisId = bachelorThesisParsedUrl.pathname.split('/')[3];
        if (thesisId === undefined) {
            thesisId = bachelorThesisParsedUrl.pathname.split('/')[2];
        }
        user = await prisma.users.findMany({
            where: {
                idThesis: thesisId,
            },
        });
    } catch (err) {
        console.log(`Database error: ${err}`);
        return interaction.editReply({
            content: 'Verification failed! Contact admin.',
        });
    }
    if (user.length != 0 && user[0].status !== 'removed') {
        return interaction.editReply({
            content: 'This thesis is already used! Please contact admin.',
        });
    }
    const authorName = await scrapeThesis(bachelorThesisParsedUrl.pathname);
    if (!authorName) {
        return interaction.editReply({
            content:
                'Could not get the author name. Maybe thesis URL is wrong or the website did not respond.',
        });
    }
    const scrapedConfirmationStudy = await scrapeConfirmationStudies(
        idConfirmationMuniParsedUrl.pathname
    );
    if (!scrapedConfirmationStudy) {
        return interaction.editReply({
            content:
                'Could not get infromation from the confirmation of studies. Maybe confirmation of studies URL is wrong or the website did not respond.',
        });
    }

    if (user[0]?.status === 'removed') {
        try {
            await prisma.users.delete({
                where: {
                    id: user[0].id,
                },
            });
        } catch (err) {
            console.log(`Database error: ${err}`);
            return interaction.editReply({
                content: 'Verification failed! Contact admin.',
            });
        }
    }
    const roleProgramm = await assignRole(
        interaction,
        scrapedConfirmationStudy,
        authorName,
        bachelorThesisParsedUrl
    );
    if (roleProgramm) {
        return interaction.editReply({
            content:
                'You have been successfully verified with role ' +
                roleProgramm.name +
                '.',
        });
    }
    return interaction.editReply({
        content:
            'Verification failed check if you entered the correct information or contact admin.',
    });
}
