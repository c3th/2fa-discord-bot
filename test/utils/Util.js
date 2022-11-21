import { config } from 'dotenv'
config();

import fse from 'fs-extra'
import path from 'path'


export class Util {
    constructor(client) {
        this.client = client;
        this.encryption = this.client.encryption;
        this.auth = this.client.auth;
        this.cache = this.client.cache;
        this.qr = this.client.qr;
    }

    parseFilePath(data) {
        return path.join(import.meta.url, '../../..', data);
    }

    parseDirPath(data) {
        // Checks if the OS is linux, is probably another way but this worked so ye
        const metaURL = (process.env['LINUX'] === 'false' ? true : false)
            ? import.meta.url.replace('file:///', '')
            : import.meta.url.replace('file://', '')
        return path.join(metaURL, '../..', data);
    }

    async writeEncryptedFile(data, message) {
        const fileName = message.author.id + '.db';
        const userPath = path.join(this.parseDirPath('./assets/db'), fileName);
        try {
            const validateOTP = await this.auth.parseOTP(
                data.toString()
            );
            // Won't actually do anything, just there for pretty :)
            if (!validateOTP) throw new Error('Failed to validate the OTP data given.');
            console.log(validateOTP);

            const json = JSON.stringify([data]);
            console.log('stringified json', json);

            let encryptedData = this.encryption.cipher(json);

            if (fse.existsSync(userPath) && this.cache.has(message.author.id)) {
                const userData = this.cache.get(message.author.id);
                await userData.codes.push(data);

                // TODO: Cipher with already existing key, maybe
                encryptedData = this.encryption.cipher(
                    JSON.stringify(userData.codes)
                );
                await this.cache.delete(message.author.id);
                console.log('new encrypted data', encryptedData);
            }
            console.log('encrypted data', encryptedData);

            await fse.writeFileSync(userPath, encryptedData.data);
            const qrCode = await this.qr.generateQrKey(encryptedData, message);
            return qrCode;
        } catch (err) {
            // console.log(err);
            throw new Error('WriteEncryptedFileError: ' + err.message);
        }
    }

    async readEncryptedFile({ keyBuff, ivBuff }, message) {
        try {
            const fileName = message.author.id + '.db';
            const userPath = path.join(this.parseDirPath('./assets/db'), fileName);
            const fileEcnryption = await fse.readFileSync(userPath).toString('utf-8');
            const decryption = this.encryption.decipher(fileEcnryption, keyBuff, ivBuff);
            return JSON.parse(decryption);
        } catch (err) {
            console.log(err);
            throw new Error('ReadEncryptedFileError: This key does not correspond with the registered user id');
        }
    }
}