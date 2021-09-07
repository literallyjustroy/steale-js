import { getItemPrice, getLoggedInUser, readCookies } from './util/util';
import { attemptPurchase, moneySpent } from './buy';
import { log, transactions } from './util/log';
import 'source-map-support/register'; // Error handling showing typescript lines
import settings from './settings.json';

const productId = '20573078'; // shaggy
const avgPrice = 1119; // !! NEVER USE AVERAGE PRICE, ex: avg price 3137 for perf legit business hat, value: 6000
const profitMarginPercent = 0; // The average price is an estimate in any case, so this can be 0
const maxMoneySpentCutoff = 100000; // Shut down monitor loop after 100,000 rbx spent.

const priceCutPercent = 0.30; // Roblox take's 30% cut of transactions

const cookies = readCookies();

(async () => {
    const username = await getLoggedInUser(cookies);

    if (username) {
        log.info(`Signed in as ${username}`);

        log.info(`Monitoring item ${settings.baseUrl}/catalog/${productId}`);

        while (moneySpent < maxMoneySpentCutoff) {
            await monitor();
        }
    } else {
        log.error('Unable to sign in using provided cookies. Try running \'npm run auth\'');
    }

    log.info('Shutting down...');
})();

async function monitor() {
    const lowestPrice = await getItemPrice(`${settings.baseUrl}/catalog/${productId}`);
    if (lowestPrice !== undefined && lowestPrice != 0) {
        const potentialProfit = Math.floor((avgPrice * (1 - priceCutPercent - profitMarginPercent)) - lowestPrice); // 30% cut along with extra margins
        if (potentialProfit > 0) {
            log.debug(`Buying item for ${lowestPrice}. Profit: `, potentialProfit);

            try {
                await attemptPurchase(productId, lowestPrice, cookies, potentialProfit);
            } catch (e) {
                transactions.error('Uncaught error buying item; did we miss it?', e);
            }
        }
    }
}
