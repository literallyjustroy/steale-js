import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import { log } from './log';
import settings from '../settings.json';

/*export function getCookieString(cookies: puppeteer.Protocol.Network.Cookie[]): string {
    let cookieString = '';

    cookies.forEach(cookie => {
        cookieString = `${cookieString}${cookie.name}=${cookie.value}; `;
    });

    return cookieString;
}*/

export async function getItemPrice(url: string): Promise<number | undefined> {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const html = parse(await response.text());
        const priceInfo = html.querySelector('.price-info');
        let priceText = priceInfo.querySelector('.text-robux-lg').text;
        priceText = priceText.replace(',', '');

        if (isNumeric(priceText)) {
            return +priceText;
        }

        log.error('Non numeric price text: ' + priceText);
        return undefined;
    } catch (e) {
        log.error('Error getting item details in HTML');
        return undefined;
    }
}

export async function getLoggedInUser(cookies: puppeteer.Protocol.Network.Cookie[]): Promise<string | null> {
    const browser: Browser = await getBrowser(true);
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto(settings.baseUrl);
    const username = await page.$eval('.user-name-container', el => el.textContent);
    await browser.close();

    return username;
}

export function readCookies(): puppeteer.Protocol.Network.Cookie[] {
    const cookiesString = fs.readFileSync('./cookies.json', 'utf8');
    const cookies = JSON.parse(cookiesString);

    const rbxSecCookie = cookies.find((cookie: puppeteer.Protocol.Network.Cookie) => cookie.name === '.ROBLOSECURITY');
    if (rbxSecCookie === undefined) {
        throw Error('No .ROBLOSECURITY cookie found');
    }

    return [rbxSecCookie];
}

// export async function sleep(ms: number): Promise<void> {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

function isNumeric(num: string): boolean {
    return !Number.isNaN(num);
}

export async function getBrowser(isHeadlessWOnly: boolean): Promise<Browser> {
    if (process.arch === 'arm') {
        return await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/chromium-browser'
        });
    } else {
        return await puppeteer.launch({ headless: isHeadlessWOnly });
    }
}
