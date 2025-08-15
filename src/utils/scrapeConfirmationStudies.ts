import axios from 'axios';
import { load } from 'cheerio';
import { logger } from '../logger';

/**
 * Scrapes the confirmation studies from the given path.
 */
export async function scrapeConfirmationStudies(pathname: string) {
    let response;
    logger.info('Scraping confirmation of studies.');
    try {
        response = await axios.get(
            'https://is.muni.cz' + pathname + '?lang=en'
        );
    } catch (e) {
        console.debug(e);
        return null;
    }
    const $ = load(response.data);
    logger.info('Extracting user information from the confirmation page.');
    const userInfo = $(
        '#el_potvrzeni > div.column.small-12.medium-8.large-8 > div'
    );
    logger.info(`Parsed data from the page ${userInfo}.`);
    const children = userInfo
        .children()
        .map((_, el) => $(el).text())
        .get();
    const splitted: Array<string[]> = [];
    children.forEach((child) => {
        splitted.push(
            child
                .replace(/\t+/g, '')
                .split(/\n+/g)
                .filter((el) => el)
        );
    });
    const mappedData = Object.fromEntries(splitted);
    return mappedData;
}
