import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    if (process.env.RBX_USER == null || process.env.RBX_PASS == null) {
        console.error('Environment Variables RBX_USER and RBX_PASS must be defined');
        process.exit();
    }

    const browser = await puppeteer.launch({ headless: false });
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
        console.log('Cookies saved');
    } catch (e) {
        console.error('verification blows');
    }

    await browser.close();
})();

async function saveCookies(page: puppeteer.Page) {
    const cookies = await page.cookies();

    fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 4));
}
