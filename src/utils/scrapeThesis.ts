import { logger } from '../logger';
import { ThesisInfo } from './ThesisInfo';

const DSPACE_HOSTS = ['dspace.vutbr.cz', 'dspace.vut.cz'];

function buildThesisApiUrl(bachelorThesisLink: URL) {
    const pathname = bachelorThesisLink.pathname.replace(/^\/+/, '');

    if (bachelorThesisLink.hostname === 'hdl.handle.net') {
        logger.info('Getting thesis from hdl.handle.net');
        return `https://${DSPACE_HOSTS[0]}/server/api/pid/find?id=${pathname}`;
    }

    if (!DSPACE_HOSTS.includes(bachelorThesisLink.hostname)) {
        logger.error(
            'Thesis link is not from a supported DSpace or handle URL'
        );
        return null;
    }

    if (pathname.startsWith('handle/')) {
        logger.info('Getting thesis from DSpace handle URL');
        return `https://${DSPACE_HOSTS[0]}/server/api/pid/find?id=${pathname.replace('handle/', '')}`;
    }

    if (pathname.startsWith('items/')) {
        logger.info('Getting thesis from DSpace item URL');
        return `https://${DSPACE_HOSTS[0]}/server/api/core/${pathname}`;
    }

    logger.error('Thesis link is not from a supported DSpace or handle URL');
    return null;
}

/**
 * Scrapes name from the bachelor thesis.
 */
export async function scrapeThesis(bachelorThesisLink: URL) {
    if (!bachelorThesisLink) {
        logger.error('Thesis link is empty');
        return null;
    }
    logger.info(`Scraping thesis from ${bachelorThesisLink.hostname}`);

    const thesisUrl = buildThesisApiUrl(bachelorThesisLink);
    if (!thesisUrl) {
        return null;
    }

    logger.info(`Fetching thesis info from ${thesisUrl}`);
    let parsedName = '';
    try {
        const response = await fetch(thesisUrl, { redirect: 'follow' });
        if (!response.ok) {
            logger.error(
                `Failed to fetch thesis info: ${response.status} ${response.statusText}`
            );
            return null;
        }
        const thesisInfo: ThesisInfo = await response.json();
        const authorMetadata = thesisInfo.metadata['dc.contributor.author'];
        if (!authorMetadata?.length) {
            logger.error('No author metadata found in thesis response');
            return null;
        }
        parsedName = authorMetadata[0].value
            .split(',')
            .reverse()
            .map((name) => name.trim())
            .join(' ');
    } catch (e) {
        logger.error(`Error fetching thesis info: ${e}`);
        return null;
    }
    logger.info(`Parsed name from thesis: ${parsedName}`);
    return parsedName;
}
