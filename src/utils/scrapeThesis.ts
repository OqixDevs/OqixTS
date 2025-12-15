import axios from 'axios';
import { load } from 'cheerio';
import { logger } from '../logger';
/**
 * Scrapes name from the bachelor thesis.
 */
export async function scrapeThesis(bachelorThesisPath: string) {
    let response;
    logger.info('Scraping author name from the thesis.');
    try {
        response = await axios.get(
            'https://dspace.vutbr.cz' + bachelorThesisPath
        );
    } catch (e) {
        logger.error(e);
        try {
            response = await axios.get(
                'https://hdl.handle.net' + bachelorThesisPath
            );
        } catch (error) {
            logger.error(error);
            return null;
        }
    }
    const $ = load(response.data);
    logger.info('Parsing author name from the page.');
    const authorName = $(
        'ds-metadata-representation-list.ds-item-page-mixed-author-field span.dont-break-out'
    )
        .first()
        .text()
        .trim();
    logger.info(`Parsed author name from the page ${authorName}.`);
    return authorName
        .split(',')
        .reverse()
        .map((name) => name.trim())
        .join(' ');
}
