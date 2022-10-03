"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.load_cookies = exports.save_cookie = void 0;
const crypto = __importStar(require("crypto"));
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
const zlib_1 = require("zlib");
(0, dotenv_1.config)({
    path: (0, path_1.join)(__dirname, '..', '.env'),
});
const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : crypto.randomBytes(32);
const iv = process.env.IV ? Buffer.from(process.env.IV, 'hex') : crypto.randomBytes(16);
function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
function decrypt(text) {
    const iv = Buffer.from(text.iv, 'hex');
    const encryptedText = Buffer.from(text.encryptedData, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
const save_cookie = (cookie_location, cookies) => {
    const data = JSON.stringify((0, zlib_1.deflateSync)(JSON.stringify(cookies)).toJSON());
    const encrypted = encrypt(data);
    (0, fs_1.writeFileSync)(cookie_location, JSON.stringify(encrypted));
};
exports.save_cookie = save_cookie;
const load_cookies = (cookie_location) => {
    const encrypted = JSON.parse((0, fs_1.readFileSync)(cookie_location).toString());
    return JSON.parse((0, zlib_1.inflateSync)(Buffer.from(JSON.parse(Buffer.from(decrypt(encrypted)).toString()).data)).toString());
};
exports.load_cookies = load_cookies;
//# sourceMappingURL=handleCookie.js.map