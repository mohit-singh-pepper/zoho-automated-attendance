//Checking the crypto module
import * as crypto from 'crypto'
import { config } from 'dotenv'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { deflateSync, inflateSync } from 'zlib'

config({
	path: join(__dirname, '..', '.env'),
})

const algorithm = 'aes-256-cbc' //Using AES encryption
const key = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : crypto.randomBytes(32)
const iv = process.env.IV ? Buffer.from(process.env.IV, 'hex') : crypto.randomBytes(16)

function encrypt(text: string) {
	let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
	let encrypted = cipher.update(text)
	encrypted = Buffer.concat([encrypted, cipher.final()])
	return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
}

function decrypt(text: { iv: string; encryptedData: string }) {
	const iv = Buffer.from(text.iv, 'hex')
	const encryptedText = Buffer.from(text.encryptedData, 'hex')
	const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)

	let decrypted = decipher.update(encryptedText)
	decrypted = Buffer.concat([decrypted, decipher.final()])

	return decrypted.toString()
}

export const save_cookie = (
	cookie_location: string,
	cookies: {
		accounts: any[]
		people: any[]
	}
) => {
	const data = JSON.stringify(deflateSync(JSON.stringify(cookies)).toJSON())
	const encrypted = encrypt(data)
	writeFileSync(cookie_location, JSON.stringify(encrypted))
}

export const load_cookies = (cookie_location: string) => {
	const encrypted = JSON.parse(readFileSync(cookie_location).toString())

	return JSON.parse(inflateSync(Buffer.from(JSON.parse(Buffer.from(decrypt(encrypted)).toString()).data)).toString())
}
