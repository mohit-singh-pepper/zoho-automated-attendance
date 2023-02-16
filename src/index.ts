// Generated by Selenium IDE
import {Builder, By, logging, WebDriver} from 'selenium-webdriver'
import {join} from 'path'
import {Options} from 'selenium-webdriver/chrome.js'
import axios from 'axios'
import {getPayload} from './getPayload'
import {load_cookies} from './handleCookie'

let runs = 0
const dashboardURL = `https://people.zoho.in/${process.env.ZOHO_LOCATION_URL}/zp#home/dashboard`

const executionStatus = process.env.EXECUTION_STATUS ?? 'check-in'

const handleLogs = (entries: logging.Entry[]) => {
	entries = entries.sort((a, b) => a.timestamp - b.timestamp)
	for (let index = 0; index < entries.length; index++) {
		const entry = entries[index]
		console.log(entry)
	}
}

const sleep = async (timeout = 3000) => {
	return await new Promise((resolve) => setTimeout(resolve, timeout))
}
const allowedStatuses = ['check-in', 'check-out'];
const executionString = executionStatus === 'check-in' ? 'Check-In' : 'Check-Out'
const run = async (): Promise<void> => {
	const options = new Options();
	// options.addArguments('--headless');
	['--incognito', '--js-flags=--expose-gc'].forEach(function (v) {
		options.addArguments(v)
	})
	options.setLoggingPrefs({performance: 'ALL', browser: 'ALL', client: 'ALL'})

	options.setUserPreferences({
		'profile.default_content_setting_values.geolocation': 2,
	})

	const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
	try {
		let cookies: { accounts: any[]; people: any[] }
		const cookie_location = join(__dirname, '..', 'cookies.json')
		console.log('loading cookies')
		cookies = load_cookies(cookie_location)
		await addCookies(cookies, driver)
		await driver.get(dashboardURL)
		await sleep(1000)
		const status_tag = await driver.findElement(By.id('ZPD_Top_Att_Stat'))
		const buttonAction = await status_tag.getText()
		await sleep(1000)
		if(allowedStatuses.includes(buttonAction.toLowerCase())) {
			if (buttonAction.toLowerCase() === executionStatus.toLowerCase()) {
				console.log('executing:', executionStatus)
				await status_tag.click()
			}
		}else {
			console.log('Failed to do:', executionStatus)
			console.log('Current status:', buttonAction)
			throw new Error('Failed to do: ' + executionStatus)
		}

		await sleep(2_000)

		await driver.close()
		if (process.env.SLACK_HOOK) {
			await axios.post(process.env.SLACK_HOOK, {
				...getPayload(
					`${executionString} successful at ${new Date().toLocaleString('en-US', {
						timeZone: 'Asia/Kolkata',
					})}`,
					true
				),
			})
		}
	} catch (err) {
		console.error(err)
		await printLogs(driver)

		await driver.close()
		await driver.quit()
		if (runs === 0) {
			runs += 1
			return run()
		}
		try {
			if (process.env.SLACK_HOOK) {
				await axios.post(process.env.SLACK_HOOK, {
					...getPayload(
						`${executionString} failed at ${new Date().toLocaleString('en-US', {
							timeZone: 'Asia/Kolkata',
						})}`,
						false
					),
				})
			}
		} catch (err) {
			console.error(err)
		}
		throw new Error('Failed to execute script check-in')
	}
}

run()
	.then(() => {
		console.log('Success!')
		process.exit(0)
	})
	.catch((err) => {
		console.log(err)
		process.exit(1)
	})

async function addCookies(cookies: { accounts: any[]; people: any[] }, driver: WebDriver) {
	// for accounts
	try {
		await driver.get('https://accounts.zoho.in/')
		await driver.manage().window().setRect({width: 1440, height: 900})

		await addCookie(cookies.accounts, driver)

		// for people
		await driver.get('https://people.zoho.in/')
		await addCookie(cookies.people, driver)

		return true
	} catch {
		console.log('adding cookie failed')
		return false
	}
}

async function addCookie(cookies: any[], driver: WebDriver) {
	for (let index = 0; index < cookies.length; index++) {
		const cookie = cookies[index]
		await driver.manage().addCookie(cookie)
	}
}

async function printLogs(driver: WebDriver) {
	await sleep(1000)
	const browserLogs = await driver.manage().logs().get('browser')
	const driverLogs = await driver.manage().logs().get('driver')
	const performanceLogs = await driver.manage().logs().get('performance')
	const logs: logging.Entry[] = [...browserLogs, ...driverLogs, ...performanceLogs]
	handleLogs(logs)
	return logs
}
