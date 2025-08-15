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
        'ds-metadata-representation-list.ds-item-page-mixed-author-field:nth-child(4) > ds-metadata-field-wrapper:nth-child(1) > div:nth-child(1) > div:nth-child(2) > ds-metadata-representation-loader:nth-child(1) > ds-plain-text-metadata-list-element:nth-child(1) > div:nth-child(1) > span:nth-child(1)'
    ).text();
    logger.info(`Parsed author name from the page ${authorName}.`);
    return authorName
        .split(',')
        .reverse()
        .map((name) => name.trim())
        .join(' ');
}
