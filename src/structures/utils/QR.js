
import { Canvas } from './Canvas.js'

import QRReader from 'qrcode-reader'
import Jimp from 'jimp'


// const icons = [
//     'https://cdn.discordapp.com/avatars/144187884587450369/a_7a8ea1bb82ad524dc31dea3c819370a5.png?size=128',
//     'https://cdn.discordapp.com/avatars/908478650561753158/76c0b5c1bc292aacc8102ff958f44974.png?size=128',
// 'https://cdn.discordapp.com/avatars/479305883587837963/9ac0dd802e80944e17f25e8f4c03d29c.png?size=128',
//     'https://cdn.discordapp.com/avatars/334532902022938624/9f63cb37e49881366f62d39634b4300b.png?size=128',
//     'https://cdn.discordapp.com/embed/avatars/0.png',
//     'https://cdn.discordapp.com/embed/avatars/2.png',
//     'https://cdn.discordapp.com/embed/avatars/4.png',
// ]

export class Reader {
    constructor(client) {
        this.client = client;

        this.auth = this.client.auth;
    }

    async generateQRKey(encodedKey, message) {
        return new Promise(async (res, rej) => {
            try {
                const icon = message.author.displayAvatarURL({
                    format: 'png',
                    dynamic: false,
                    size: 128
                });
                const buff = await Canvas.drawQRKeyImage(encodedKey, icon, 200, 80);
                const isValid = await this.readQRAndReturn(buff);
                if (!isValid) return this.generateQRKey(encodedKey, message);
                res(buff);
            } catch (err) {
                console.log(err);
                throw new Error('GenerateQRkeyError: ' + err.message);
            }
        });
    }

    readQRKey(data) {
        try {
            const decoded = this.auth.decodeKey(data);
            return decoded;
        } catch (err) {
            console.log('QRKeyError', err);
        }
    }

    readQRAndReturn(imageURL) {
        return new Promise(async (res, rej) => {
            const QR = new QRReader();
            try {
                const { bitmap } = await Jimp.read(imageURL);
                QR.callback = (err, value) => {
                    if (err) throw new Error(err);
                    if (Buffer.from(value.result, 'base64').toString('base64') === value.result) {
                        return res(this.readQRKey(value.result));
                    }

                    return res(this.auth.parseOTP(value.result));
                };
                QR.decode(bitmap);
            } catch (err) {
                rej(err);
            }
        });
    }
}