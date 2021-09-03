import puppeteer from 'puppeteer';
import fs from 'fs';
import { log } from './util/log';

(async () => {
    if (process.env.RBX_USER == null || process.env.RBX_PASS == null) {
        log.error('Environment Variables RBX_USER and RBX_PASS must be defined');
        process.exit();
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.roblox.com/login');
    // await page.screenshot({ path: 'example.png' });
    await page.type('#login-username', process.env.RBX_USER);
    await page.type('#login-password', process.env.RBX_PASS);
    await page.click('#login-button');
    try {
        await page.waitForNavigation();
        await page.goto('https://www.roblox.com/catalog/20573078');
        await saveCookies(page);
        log.debug('Cookies saved');
    } catch (e) {
        log.error('verification blows', e);
    }

    await browser.close();
})();

async function saveCookies(page: puppeteer.Page) {
    const cookies = await page.cookies();

    fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 4));
}
