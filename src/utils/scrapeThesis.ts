import { logger } from '../logger';
import { ThesisInfo } from './ThesisInfo';
/**
 * Scrapes name from the bachelor thesis.
 */
export async function scrapeThesis(bachelorThesisLink: URL) {
    if (!bachelorThesisLink) {
        logger.error('Thesis link is empty');
        return null;
    }
    logger.info(`Scraping thesis from ${bachelorThesisLink.hostname}`);
    let thesisUrl = '';

    if (
        bachelorThesisLink.hostname === 'dspace.vut.cz' ||
        bachelorThesisLink.hostname === 'dspace.vutbr.cz'
    ) {
        logger.info('Getting thesis from dspace.vut.cz');
        const thesisPath = bachelorThesisLink.pathname.substring(1); // Remove leading slash
        thesisUrl = `https://dspace.vut.cz/server/api/core/${thesisPath}`;
    } else if (bachelorThesisLink.hostname === 'hdl.handle.net') {
        logger.info('Getting thesis from hdl.handle.net');
        const thesisPath = bachelorThesisLink.pathname.substring(1); // Remove leading slash
        thesisUrl = `https://dspace.vut.cz/server/api/pid/find?id=${thesisPath}`;
    } else {
        logger.error('Thesis link is not from dspace.vut.cz or hdl.handle.net');
        return null;
    }
    logger.info(`Fetching thesis info from ${thesisUrl}`);
    let parsedName = '';
    try {
        const response = await fetch(thesisUrl, { redirect: 'follow' });
        const thesisInfo: ThesisInfo = await response.json();
        parsedName = thesisInfo.metadata['dc.contributor.author'][0].value
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
