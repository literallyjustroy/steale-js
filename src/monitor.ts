import { getItemPrice, getLoggedInUser, readCookies, sleep } from './util/util';
import { buy, moneySpent } from './buy';
import { log, transactions } from './util/log';
import 'source-map-support/register'; // Error handling showing typescript lines

const productId = '20573078'; // shaggy
const avgPrice = 1119; // !! NEVER USE AVERAGE PRICE, ex: avg price 3137 for perf legit business hat, value: 6000
const profitMarginPercent = 0; // The average price is an estimate in any case, so this can be 0
const maxMoneySpentCutoff = 100000; // Shut down monitor loop after 100,000 rbx spent.

const priceCutPercent = 0.30; // Roblox take's 30% cut of transactions
let errorCount = 0;

const cookies = readCookies();

(async () => {
    const username = getLoggedInUser(cookies);

    if (username) {
        log.info(`Signed in as ${username}`);
    } else {
        throw Error('Unable to sign in using provided cookies. Try running \'npm run auth\'');
    }

    log.info(`Monitoring item https://www.roblox.com/catalog/${productId}`);

    while (errorCount <= 5 && moneySpent < maxMoneySpentCutoff) {
        try {
            await monitor();
        } catch (e) {
            errorCount++;
            log.error(`Had an issue (${errorCount}): `, e);

            await sleep(5000 * errorCount); // Had an issue, waiting it out for 5 seconds per error count
        }
    }
    log.fatal(`Shutting down. (${errorCount} errors)`);
})();

async function monitor() {
    const lowestPrice = await getItemPrice(`https://www.roblox.com/catalog/${productId}`);
    if (lowestPrice !== undefined && lowestPrice != 0) {
        const potentialProfit = Math.floor((avgPrice * (1 - priceCutPercent - profitMarginPercent)) - lowestPrice); // 30% cut along with extra margins
        if (potentialProfit > 0) {
            log.debug(`Buying item for ${lowestPrice}. Profit: `, potentialProfit);

            try {
                await buy(productId, lowestPrice, cookies, potentialProfit);
            } catch (e) {
                transactions.error('Uncaught error buying item; did we miss it?', e);
            }
        }

        if (errorCount > 0) {
            errorCount--; // Each success lowers error count
        }
    }
}
