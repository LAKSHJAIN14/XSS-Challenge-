const puppeteer = require('puppeteer');
const sleep = ms => new Promise(res => setTimeout(res, ms));

const CONFIG = {
    APPNAME: process.env['APPNAME'] || "Admin",
    APPURL: process.env['APPURL'] || "http://127.0.0.1:5000",  // Adjust to your Flask server URL
    APPFLAG: process.env['APPFLAG'] || "dev{flag}",
    APPLIMITTIME: Number(process.env['APPLIMITTIME'] || "60"),
    APPLIMIT: Number(process.env['APPLIMIT'] || "5"),
};

console.table(CONFIG);

// Get the URL from command-line arguments
const urlToVisit = process.argv[2];  // The URL will be passed as an argument from Python
if (!urlToVisit) {
    console.error("No URL provided to the bot");
    process.exit(1);
}

const initBrowser = puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser", // Adjust path if necessary
    headless: true,
    args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--no-gpu',
        '--disable-default-apps',
        '--disable-translate',
        '--disable-device-discovery-notifications',
        '--disable-software-rasterizer',
        '--disable-xss-auditor',
    ],
    ignoreHTTPSErrors: true
});

console.log("Bot started...");

async function botVisit(urlToVisit) {
    const browser = await initBrowser;
    let page;
    try {
        // Validate URL first
        if (!urlToVisit.startsWith('http')) {
            throw new Error('Invalid URL - must start with http:// or https://');
        }
        const parsedUrl = new URL(urlToVisit);
        
        // Create page first
        page = await browser.newPage();
        
        // Set proper cookie with required attributes
        await page.setCookie({
            name: 'cookie',
            value: 'SUPER_SECRET_ADMIN_TOKEN',
            domain: parsedUrl.hostname,
            path: '/', // Required for cookie scope
            httpOnly: true,
            secure: parsedUrl.protocol === 'https:', // Auto-set security
            sameSite: 'Lax' // Modern browser requirement
        });

        // Set console listener BEFORE navigation
        page.on('console', (msg) => {
            console.log('PAGE LOG:', msg.text());
        });

        console.log(`Bot visiting: ${urlToVisit}`);
        
        // Navigate with proper waiting
        await page.goto(urlToVisit, {
            waitUntil: 'networkidle2',
            timeout: 15000 // Increased timeout
        });

        // Use waitForTimeout instead of sleep
        await page.waitForTimeout(2000); // Wait for JS execution

        console.log("Bot finished visiting.");
        return true;
    } catch (error) {
        console.error('Bot visit failed:', error.message);
        console.error('Failed URL:', urlToVisit);
        return false;
    } finally {
        // Proper cleanup in finally block
        if (page && !page.isClosed()) {
            await page.close().catch(e => console.error('Page close error:', e));
        }
        if (browser) {
            await browser.close().catch(e => console.error('Browser close error:', e));
        }
    }
}

botVisit(urlToVisit);

