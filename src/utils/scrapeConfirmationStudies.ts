import axios from 'axios';
import { load } from 'cheerio';

/**
 * Scrapes the confirmation studies from the given path.
 */
export async function scrapeConfirmationStudies(pathname: string) {
    let response;
    try {
        response = await axios.get(
            'https://is.muni.cz' + pathname + '?lang=en'
        );
    } catch (e) {
        console.debug(e);
        return null;
    }
    const $ = load(response.data);
    const userInfo = $(
        '#el_potvrzeni > div.column.small-12.medium-9.large-9 > div'
    );
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
