import axios from 'axios';
import { load } from 'cheerio';
/**
 * Scrapes name from the bachelor thesis.
 */
export async function scrapeThesis(bachelorThesisPath: string) {
    let response;
    try {
        response = await axios.get(
            'https://dspace.vutbr.cz' + bachelorThesisPath
        );
    } catch (e) {
        console.debug(e);
        return null;
    }
    const $ = load(response.data);
    const authorName = $(
        'ds-metadata-representation-list.ds-item-page-mixed-author-field:nth-child(4) > ds-metadata-field-wrapper:nth-child(1) > div:nth-child(1) > div:nth-child(2) > ds-metadata-representation-loader:nth-child(1) > ds-plain-text-metadata-list-element:nth-child(1) > div:nth-child(1) > a:nth-child(1)'
    ).text();
    return authorName
        .split(',')
        .reverse()
        .map((name) => name.trim())
        .join(' ');
}
