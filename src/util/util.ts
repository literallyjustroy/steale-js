import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import { log } from './log';
import { ItemDetails } from '../models/itemDetails';

export function getCookieString(cookies: puppeteer.Protocol.Network.Cookie[]): string {
    const rbxSecCookie = cookies.find(cookie => cookie.name === '.ROBLOSECURITY');
    if (rbxSecCookie === undefined) {
        throw Error('No .ROBLOSECURITY cookie found');
    }

    let cookieString = '';

    cookies.forEach(cookie => {
        cookieString = `${cookieString}${cookie.name}=${cookie.value}; `;
    });

    return cookieString;
}

export async function getItemDetails(url: string, cookieString: string): Promise<ItemDetails> {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'cookie': cookieString,
            }
        });
        const html = parse(await response.text());
        const itemHtml = html.querySelector('#item-container');

        return {
            productId: itemHtml.getAttribute('data-product-id') as string,
            type: itemHtml.getAttribute('data-item-type') as string,
            name: itemHtml.getAttribute('data-item-name') as string,
            currency: +(itemHtml.getAttribute('data-expected-currency') as string),
            expectedPrice: +(itemHtml.getAttribute('data-expected-price') as string),
            sellerName: itemHtml.getAttribute('data-seller-name') as string,
            sellerId: +(itemHtml.getAttribute('data-expected-seller-id') as string),
            userAssetId: +(itemHtml.getAttribute('data-userasset-id') as string),
        };
    } catch (e) {
        log.error('Error getting item details in HTML');
        throw e;
    }
}

export function readCookies(): puppeteer.Protocol.Network.Cookie[] {
    const cookiesString = fs.readFileSync('./cookies.json', 'utf8');
    return JSON.parse(cookiesString);
}

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
