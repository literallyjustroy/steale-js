import { performance } from 'perf_hooks';
import { getCookieString, getItemDetails, readCookies, sleep } from './util/util';
import { buy, moneySpent } from './buy';
import { log, transactions } from './util/log';
import 'source-map-support/register'; // Error handling showing typescript lines

const productId = '494291269'; // smiley face
const avgPrice = 70000; // !! NEVER USE AVERAGE PRICE, ex: avg price 3137 for perf legit business hat, value: 6000
const profitMarginPercent = 0; // The average price is an estimate in any case, so this can be 0

const priceCutPercent = 0.30; // Roblox take's 30% cut of transactions
let errorCount = 0;

(async () => {
    log.info(`Monitoring item https://www.roblox.com/catalog/${productId}`);

    while (errorCount <= 5 && moneySpent < 10000) {
        try {
            await monitor();
        } catch (e) {
            errorCount++;
            log.error(`Had an issue (${errorCount}): `, e);

            await sleep(5000 * errorCount); // Had an issue, waiting it out for 5 seconds per error count
        }
    }
    log.fatal(`Too many errors (${errorCount}), time to take a nap`);
})();

async function monitor() {
    const start = performance.now();

    const cookies = readCookies();
    const cookieString = getCookieString(cookies);
    const itemDetails = await getItemDetails(`https://www.roblox.com/catalog/${productId}`, cookieString);
    if (itemDetails.expectedPrice != 0) {
        const potentialProfit = (avgPrice * (1 - priceCutPercent - profitMarginPercent)) - itemDetails.expectedPrice; // 30% cut along with extra margins
        if (potentialProfit > 0) {
            transactions.debug(`Buying item for ${Math.floor(potentialProfit)} profit:\n`, itemDetails);

            await buy(productId, itemDetails, cookies, potentialProfit);
        }

        if (errorCount > 0) {
            errorCount--; // Each success lowers error count
        }
    } else {
        log.error('Expected price of 0?');
    }

    const end = performance.now();
    log.info(`Took ${end - start} miliseconds`);
}
