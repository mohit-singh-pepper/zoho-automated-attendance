"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const selenium_webdriver_1 = require("selenium-webdriver");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const chrome_js_1 = require("selenium-webdriver/chrome.js");
const fs_1 = require("fs");
const axios_1 = __importDefault(require("axios"));
const getPayload_1 = require("./getPayload");
const { Type } = selenium_webdriver_1.logging;
console.log(Type);
(0, dotenv_1.config)({
    path: (0, path_1.join)(__dirname, '..', '.env'),
});
let runs = 0;
const dashboardURL = 'https://people.zoho.in/peppercontentglobal/zp#home/dashboard';
const executionStatus = (_a = process.env.EXECUTION_STATUS) !== null && _a !== void 0 ? _a : '';
const handleLogs = (entries) => {
    entries = entries.sort((a, b) => a.timestamp - b.timestamp);
    for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        console.log(entry);
    }
};
const sleep = async (timeout = 3000) => {
    return await new Promise((resolve) => setTimeout(resolve, timeout));
};
const isDebug = process.env.NODE_ENV === 'development';
const executionString = executionStatus === 'check-in' ? 'Check-In' : 'Check-Out';
const run = async () => {
    const options = new chrome_js_1.Options();
    let cookies = { accounts: [], people: [] };
    const cookie_location = (0, path_1.join)(__dirname, '..', 'cookies.json');
    if ((0, fs_1.existsSync)(cookie_location)) {
        cookies = JSON.parse((0, fs_1.readFileSync)(cookie_location).toString());
    }
    if (!isDebug) {
        options.addArguments('--headless');
    }
    ;
    ['--incognito', '--js-flags=--expose-gc'].forEach(function (v) {
        options.addArguments(v);
    });
    options.setLoggingPrefs({ performance: 'ALL', browser: 'ALL', client: 'ALL' });
    options.setUserPreferences({
        'profile.default_content_setting_values.geolocation': 2,
    });
    const driver = await new selenium_webdriver_1.Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        const cookie_status = await addCookies(cookies, driver);
        await driver.get(dashboardURL);
        const current_url = await driver.getCurrentUrl();
        if (cookie_status === false || current_url !== dashboardURL) {
            if (!isDebug || process.env.ALLOW_LOGIN_IN_DEBUG === 'true') {
                await handleLogin(driver);
            }
            await driver.get(dashboardURL);
        }
        await sleep(1000);
        const status_tag = await driver.findElement(selenium_webdriver_1.By.id('ZPD_Top_Att_Stat'));
        const current_status = await status_tag.getText();
        await sleep(1000);
        console.log(current_status, status_tag);
        if (current_status.toLowerCase() === executionStatus.toLowerCase()) {
            console.log('executing:', executionStatus);
            await status_tag.click();
        }
        else {
            runs += 1;
            console.log('Failed to do:', executionStatus);
            console.log('Current status:', current_status);
            throw new Error('Failed to do: ' + executionStatus);
        }
        runs += 1;
        await sleep(2000);
        if (!isDebug)
            await driver.close();
        if (process.env.SLACK_HOOK) {
            await axios_1.default.post(process.env.SLACK_HOOK, Object.assign({}, (0, getPayload_1.getPayload)(`${executionString} successful at ${new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Kolkata',
            })}`, true)));
        }
    }
    catch (err) {
        console.error(err);
        await printLogs(driver);
        await driver.close();
        await driver.quit();
        if (runs === 0) {
            runs += 1;
            return run();
        }
        try {
            if (process.env.SLACK_HOOK) {
                await axios_1.default.post(process.env.SLACK_HOOK, Object.assign({}, (0, getPayload_1.getPayload)(`${executionString} failed at ${new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Kolkata',
                })}`, false)));
            }
        }
        catch (err) {
            console.error(err);
        }
        throw new Error('Failed to execute script check-in');
    }
};
run()
    .then(() => {
    console.log('Success!');
    process.exit(0);
})
    .catch((err) => {
    console.log(err);
    process.exit(1);
});
async function addCookies(cookies, driver) {
    try {
        await driver.get('https://accounts.zoho.in/');
        await driver.manage().window().setRect({ width: 1440, height: 900 });
        await addCookie(cookies.accounts, driver);
        await driver.get('https://people.zoho.in/');
        await addCookie(cookies.people, driver);
        return true;
    }
    catch (_a) {
        console.log('adding cookie failed');
        return false;
    }
}
async function addCookie(cookies, driver) {
    for (let index = 0; index < cookies.length; index++) {
        const cookie = cookies[index];
        await driver.manage().addCookie(cookie);
    }
}
async function handleLogin(driver) {
    await driver.get('https://accounts.zoho.in/signin');
    await driver.findElement(selenium_webdriver_1.By.id('login_id')).sendKeys(process.env.ZOHO_EMAIL);
    await driver.findElement(selenium_webdriver_1.By.id('login_id')).sendKeys(selenium_webdriver_1.Key.ENTER);
    await sleep(1000);
    await driver.findElement(selenium_webdriver_1.By.id('password')).sendKeys(process.env.ZOHO_PASSWORD);
    await driver.findElement(selenium_webdriver_1.By.id('password')).sendKeys(selenium_webdriver_1.Key.ENTER);
    await sleep(4000);
    await driver.get('https://accounts.zoho.in/');
    const accounts = await driver.manage().getCookies();
    console.log('accounts', accounts);
    await driver.get(dashboardURL);
    const people = await driver.manage().getCookies();
    console.log('people', people);
    const cookies = { accounts, people };
    (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, '..', 'cookies.json'), JSON.stringify(cookies, undefined, 4));
}
async function printLogs(driver) {
    return '';
    await sleep(1000);
    const browserLogs = await driver.manage().logs().get('browser');
    const driverLogs = await driver.manage().logs().get('driver');
    const performanceLogs = await driver.manage().logs().get('performance');
    const logs = [...browserLogs, ...driverLogs, ...performanceLogs];
    handleLogs(logs);
    return logs;
}
//# sourceMappingURL=index.js.map