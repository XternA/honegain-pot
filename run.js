const puppeteer = require('puppeteer');
const { Colours, BANNER } = require('./modules/shared');
const api = require('./modules/api');
const fs = require('fs');
require('dotenv').config();

const NAVIGATION_TIMEOUT = 200;
const URL = 'https://dashboard.honeygain.com/login'
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const PROCESS_WAIT = process.env.PROCESS_WAIT || false;

async function login(page) {
    await page.type('#email', EMAIL);
    await page.type('#password', PASSWORD);
    await page.click('.sc-gKAaef.dkmdPN.hg-login-with-email');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
}

async function getWalletType(page) {
    const walletType = await page.evaluate(() => {
        const class_element = '.sc-bdnyFh.TabView--iz8vgv.eBvbpx'
        const honeygain = document.querySelector(`${class_element}.lozQhY`);
        const JumpTask = document.querySelector(`${class_element}.fqjmKU`);
        return honeygain ? honeygain.textContent : JumpTask.textContent;
    });
    console.log(`${Colours.GREEN}Earning with ${Colours.YELLOW}${walletType}${Colours.RESET} 💰`);
}

async function getEarnedToday(page) {
    const earnedToday = await page.evaluate(() => {
        const element = document.querySelector('.sc-jSFipO.dTHoSl span');
        return element ? element.textContent.trim() : null;
    });
    if (earnedToday) {
        console.log(`${Colours.GREEN}Earned today ${Colours.PINK}${earnedToday}${Colours.GREEN} credits${Colours.RESET} 🍯`);
    }
}

async function getHoneygainBalance(page, accessToken) {
    const balance = await page.evaluate(() => {
        const element = document.querySelector('.sc-bdnyFh.bcYZov');
        return element ? element.textContent.trim() : null
    });
    if (balance) {
        await api.getHoneygainBalance(accessToken);
        console.log(`${Colours.GREEN}Honeygain balance ${Colours.PINK}${balance}${Colours.RESET} 💵`);
    }
}

async function getRemainingTimer(page) {
    const waitTimer = await page.evaluate(() => {
        const element = document.querySelector('.sc-jHcYKR.hUOVCo');
        return element ? element.textContent : null;
    });

    if (waitTimer) {
        const parseTime = (timeString) => {
            const regex = /(\d+) hours (\d+) min (\d+) sec/;
            const matches = timeString.match(regex);
            if (matches && matches.length === 4) {
                const hours = parseInt(matches[1]);
                const minutes = parseInt(matches[2]);
                const seconds = parseInt(matches[3]);
                return { hours, minutes, seconds };
            } else {
                return null;
            }
        };

        const remainingTime = parseTime(waitTimer);
        if (remainingTime) {
            console.log(`${Colours.GREEN}Waiting for next available pot to claim 🍯${Colours.RESET}`);
            let remainingSeconds = remainingTime.hours * 3600 + remainingTime.minutes * 60 + remainingTime.seconds;

            if (remainingSeconds > 0) {
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;
                if (PROCESS_WAIT) {
                    fs.writeFileSync('timestamp', remainingSeconds.toString());
                    return;
                }
                console.log(`${Colours.GREEN}Ready to claim again in ${Colours.CYAN}${hours}${Colours.RESET} hours ${Colours.CYAN}${minutes}${Colours.RESET} minutes ${Colours.CYAN}${seconds}${Colours.RESET} seconds ⏱️`);
                return;
            }
            console.log(`${Colours.GREEN}Ready to claim again${Colours.RESET} ✅\n\n`);
        } else {
            console.log('Invalid time format.');
        }
    }
}

// Bootstrap
(async () => {
    console.log(`${Colours.YELLOW}------------ Honeygain Pot Auto Claim ------------${Colours.RESET}`);
    console.log(`${Colours.CYAN}Starting login process...${Colours.RESET}`);
    const browser = await puppeteer.launch({
        headless: true,
        slowMo: NAVIGATION_TIMEOUT,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-software-rasterizer',
            '--disable-gpu',
            '--disable-background-networking',
            '--disable-translate',
            '--disable-sync',
        ],
    });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Cookie consent
    await page.waitForSelector('.sc-gKAaef.eFCJQX');
    await page.click('.sc-gKAaef.eFCJQX');

    try {
        // Login
        console.log(`Logging in as ${Colours.RED}${EMAIL}${Colours.RESET}`)
        const accessToken = await api.getAccessToken(EMAIL, PASSWORD);
        await login(page);

        // Wait to verify logged in successfully and proceed
        if (await page.$('.sc-jSFipO.hpiezR')) {
            console.log('Logged into Honeygain 🐝');
            console.log(BANNER);

            await getWalletType(page);
            await api.claimPotReward(accessToken);
            await api.getWinningCredits(accessToken);
            await getEarnedToday(page);
            await getHoneygainBalance(page, accessToken);
            await getRemainingTimer(page);
        } else {
            console.log('Couldn\'t log into Honeygain 🐝');
            console.log(BANNER);
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();