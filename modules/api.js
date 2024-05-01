const { Colours, Endpoint } = require('./shared');
const axios = require('axios');

const BASE_URL = 'https://dashboard.honeygain.com/api/v1';

function getHeaders(access_token) {
    return {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    };
}

async function getAccessToken(email, password) {
    url = BASE_URL + Endpoint.TOKEN;
    payload = {
        'email': email,
        'password': password
    };

    try {
        const response = await axios.post(url, payload);
        return response.data.data.access_token;
    } catch (error) {
        const errorMsg = error.message
        if (errorMsg.includes('429')) {
            console.log('Couldn\'t log into Honeygain 🐝');
            console.log('Server is blocking requests due to many attempts. \nTry again in a few hours.')
            console.log(`${Colours.YELLOW}--------------------------------------------------${Colours.RESET}\n`);
            process.exit(1);
        }
        console.error(`Error logging in: ${errorMsg}`);
        throw error;
    }
}

async function getHoneygainBalance(access_token) {
    url = BASE_URL + Endpoint.BALANCE;

    try {
        const response = await axios.get(url, {
            headers: getHeaders(access_token)
        });
        const currentBalance = response.data.data.payout.credits;
        console.log(`${Colours.GREEN}Current balance ${Colours.PINK}${currentBalance} ${Colours.GREEN}credits${Colours.RESET} 🐝`);
    } catch (error) {
        console.error(`Error fetching balance: ${error.message}`);
        throw error;
    }
}

async function claimPotReward(access_token) {
    url = BASE_URL + Endpoint.POT;

    try {
        const response = await axios.post(url, null, {
            headers: getHeaders(access_token)
        });
        const claimedAmount = response.data.data.winning_credits;
        console.log(`${Colours.GREEN}Claimed ${Colours.PINK}${claimedAmount} ${Colours.GREEN}credit(s)${Colours.RESET} ✅`);
    } catch (error) {
        const errorMsg = error.message;
        if (errorMsg) {
            console.log(`${Colours.GREEN}Already claimed reward pot today${Colours.RESET} ❌`);
            return;
        }
        console.error(`Error claiming pot reward: ${errorMsg}`);
        throw error;
    }
}

async function getWinningCredits(access_token) {
    url = BASE_URL + Endpoint.POT;

    try {
        const response = await axios.get(url, {
            headers: getHeaders(access_token)
        });
        const wonToday = response.data.data.winning_credits;
        console.log(`${Colours.GREEN}Won today ${Colours.PINK}${wonToday}${Colours.GREEN} credits${Colours.RESET} 🪙`);
    } catch (error) {
        console.error(`Error getting winning credits: ${error.message}`);
        throw error;
    }
}

module.exports = {
    getAccessToken,
    getHoneygainBalance,
    claimPotReward,
    getWinningCredits
}