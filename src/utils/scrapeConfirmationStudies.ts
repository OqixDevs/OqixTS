import axios from 'axios';
import { load } from 'cheerio';
import { logger } from '../logger';

export async function scrapeConfirmationStudies(pathname: string) {
    const url = 'https://is.muni.cz' + pathname + '?lang=en';
    logger.info('Scraping confirmation of studies.');

    let sessionCookie: string | null = null;
    try {
        const initialResponse = await axios.get(url, {
            maxRedirects: 0,
            validateStatus: (status) => status < 400,
        });
        sessionCookie = extractSessionCookie(
            initialResponse.headers['set-cookie']
        );
    } catch (e) {
        logger.error(`Error getting session cookie: ${e}`);
        return null;
    }

    let response;
    try {
        response = await axios.get(url, {
            headers: sessionCookie ? { Cookie: sessionCookie } : {},
        });
    } catch (e) {
        logger.error(`Error fetching confirmation page: ${e}`);
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

/**
 * Extracts the __Host-issession cookie value from set-cookie headers.
 */
const SESSION_COOKIE_RE = /^(__Host-issession=[^;]+)/;

function extractSessionCookie(
    setCookie: string | string[] | undefined
): string | null {
    if (!setCookie) return null;
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    for (const cookie of cookies) {
        const match = SESSION_COOKIE_RE.exec(cookie);
        if (match) return match[1];
    }
    return null;
}
