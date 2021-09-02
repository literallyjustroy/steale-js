import puppeteer from 'puppeteer';
import { readCookies } from './util/util';

let purchases = 0;

export async function buy(productId: string, itemDetails: ItemDetails): Promise<void> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setCookie(...readCookies()); // TODO get cookies from memory
    await page.goto(`https://www.roblox.com/catalog/${productId}`);
    const buyButtonDiv = await page.$('.action-button');
    const buyButton = await buyButtonDiv?.$(`.PurchaseButton[data-expected-price="${itemDetails.expectedPrice}"]`); // TODO validation
    await buyButton?.click();
    // await page.screenshot({ path: `purchase${purchases}.png` });
    const confirmButton = await page.waitForSelector('#confirm-btn'); // TODO validation
    await confirmButton?.click();
    await page.waitForNavigation();

    purchases++;

    await browser.close();
}
