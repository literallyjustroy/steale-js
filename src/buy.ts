import puppeteer from 'puppeteer';
import { log, transactions } from './util/log';
import { getBrowser } from './util/util';

let purchases = 0;
export let moneySpent = 0;
let totalEstProfit = 0;

export async function buy(productId: string, lowestPrice: number, cookies: puppeteer.Protocol.Network.Cookie[], potentialProfit: number): Promise<void> {
    const browser = await getBrowser(true);
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto(`https://www.roblox.com/catalog/${productId}`);
    const buyButtonDiv = await page.$('.action-button');
    const buyButton = await buyButtonDiv?.$(`.PurchaseButton[data-expected-price="${lowestPrice}"]`);
    if (buyButton) {
        await buyButton.click();
        const confirmButton = await page.waitForSelector('#confirm-btn');
        if (confirmButton) {
            await confirmButton.click();
            await page.waitForNavigation();

            purchases++;
            totalEstProfit += potentialProfit;
            moneySpent += lowestPrice;
            transactions.debug(`\nTotal Purchases: ${purchases}\nTotal spent: ${moneySpent}\nTotal estimated profit: ${totalEstProfit}`);
        } else {
            log.error('Failed to find confirm button');
        }
    } else {
        log.error('Failed to find buy button; price may not exist?');
    }

    await browser.close();
}
