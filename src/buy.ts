import puppeteer, { ElementHandle } from 'puppeteer';
import { log, transactions } from './util/log';
import { getBrowser } from './util/util';
import settings from './settings.json';
import 'source-map-support/register'; // Error handling showing typescript lines

let purchases = 0;
export let moneySpent = 0;
let totalEstProfit = 0;

export async function attemptPurchase(productId: string, lowestPrice: number, cookies: puppeteer.Protocol.Network.Cookie[], potentialProfit: number): Promise<void> {
    const browser = await getBrowser(true);
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto(`${settings.baseUrl}/catalog/${productId}`);
    const buyButtonDiv = await page.$('.action-button');
    const buyButton = await buyButtonDiv?.$(`.PurchaseButton[data-expected-price="${lowestPrice}"]`);
    if (buyButton) {
        await buyButton.click();
        if (await hasSufficientFunds(page)) {
            const confirmButton = await page.waitForSelector('#confirm-btn');
            if (confirmButton) {
                await completePurchase(page, confirmButton, lowestPrice, potentialProfit);
            } else {
                log.error('Failed to find confirm button');
            }
        } else {
            log.error('Insufficient funds to make purchase :(');
        }
    } else {
        log.error('Failed to find buy button; price may not exist?');
    }

    await browser.close();
}

export async function completePurchase(page: puppeteer.Page, confirmButton: ElementHandle, lowestPrice: number, potentialProfit: number): Promise<void> {
    await confirmButton.click();
    await page.waitForNavigation();

    purchases++;
    totalEstProfit += potentialProfit;
    moneySpent += lowestPrice;
    transactions.debug(`Purchase made for ${lowestPrice} rbx\nTotal Purchases: ${purchases}\nTotal spent: ${moneySpent}\nTotal estimated profit: ${totalEstProfit}`);
}

export async function hasSufficientFunds(page: puppeteer.Page): Promise<boolean> {
    const popupDialogTitle = await page.$eval('.modal-title', el => el.textContent);
    return popupDialogTitle != 'Insufficient Funds';
}
