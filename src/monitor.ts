// noinspection InfiniteLoopJS

import { performance } from 'perf_hooks';
import { getCookieString, getItemDetails, sleep } from './util/util';
import { buy } from './buy';

const productId = '20573078'; // shaggy
const avgPrice = 1119; // !! NEVER USE AVERAGE PRICE, ex: avg price 3137 for perf legit business hat, value: 6000
let errorCount = 0;
let moneySpent = 0;
let totalEstProfit = 0;

(async () => {
    while (errorCount <= 5 && moneySpent < 10000) {
        try {
            await monitor();
        } catch (e) {
            console.error('Had an issue: ', e);
            errorCount++;
            await sleep(5000 * errorCount); // Had an issue, waiting it out for 5 seconds per error count
        }
    }
})();

async function monitor() {
    const start = performance.now();

    const cookieString = getCookieString();
    const itemDetails = await getItemDetails(`https://www.roblox.com/catalog/${productId}`, cookieString);
    const potentialProfit = (avgPrice * 0.7) - itemDetails.expectedPrice; // 30% cut
    if (potentialProfit > 0) { // TODO Make this more secure or somethin, we lose money otherwise
        console.log(`Buying item for ${Math.floor((avgPrice) - itemDetails.expectedPrice)} profit:\n`, itemDetails);

        await buy(productId, itemDetails);

        totalEstProfit += potentialProfit;
        moneySpent += itemDetails.expectedPrice;
        console.log('total spent: ' + moneySpent);
        console.log('total expected profit: ' + totalEstProfit);
    }

    errorCount--; // Each success lowers error count

    const end = performance.now();
    console.log(`Took ${end - start} miliseconds`);
}
