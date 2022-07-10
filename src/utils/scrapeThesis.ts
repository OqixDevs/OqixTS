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
        '#aspect_artifactbrowser_ItemViewer_div_item-view > div > div.row > div.col-sm-4 > div:nth-child(2) > div > a'
    ).text();

    return authorName.split(',').reverse().join(' ');
}
