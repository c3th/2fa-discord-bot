import pkg from 'canvas'
const { createCanvas, loadImage } = pkg;

import QrReader from 'qrcode-reader'
import QrCode from 'qrcode'
import Jimp from 'jimp'

const opts = {
    errorCorrectionLevel: 'H',
    quality: 0.95,
    margin: 5,
    color: {
        dark: '#000000',
        light: '#ffffff',
    },
}

class QrCodeData {
    constructor(value, data) {
        this.url = value;
        this.issuer = data.issuer;
        this.user = data.label;
        this.period = data.period;
        this.digits = data.digits;
        this.algorithm = data.algorithm;
        this.secret = data.secret.base32;
    }
}

export class Qr {
    constructor(client) {
        this.client = client;
        this.auth = this.client.auth;
    }

    roundedImage(ctx, x, y, width, height, radius) {
        // Stolen from some site where the avatar gets circled 
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    async createQrCanvas(data, icon, width, cwidth) {
        const canvas = createCanvas(width, width);
        QrCode.toCanvas(canvas, data, opts);

        const ctx = canvas.getContext('2d');
        const center = (canvas.width / 2) - cwidth / 2;
        const imageIcon = await loadImage(icon);
        this.roundedImage(ctx, center, center, cwidth, cwidth, 43);
        ctx.clip();
        ctx.drawImage(imageIcon, center, center, cwidth, cwidth);
        return canvas.toBuffer();
    }

    async readImage(data) {
        const QR = new QrReader();
        let QRDataValue = {};

        console.log('qr image url', data);

        try {
            const { bitmap } = await Jimp.read(data);
            console.log('qr image bitmap', bitmap);
            QR.callback = (err, value) => {
                console.log(value);
                if (err) throw new Error('QrReaderError: ' + err);
                const parsedOTPData = this.auth.parseOTP(value.result);
                console.log('parsed otp data', parsedOTPData);
                QRDataValue = parsedOTPData;
            }
            QR.decode(bitmap);
            return QRDataValue;
        } catch (err) {
            console.log(err);
            throw new Error('QRReaderError: Invalid OTP QR code, please try again');
        }
    }

    async readKey(data) {
        const QR = new QrReader();

        try {
            const { bitmap } = await Jimp.read(data);
            let QRDataValue = {}

            QR.callback = (err, value) => {
                if (err) throw new Error('QrReaderError: Could not read the QR, please try again.');
                console.log('key value', value.result);

                if (Buffer.from(value.result, 'base64').toString('base64') === value.result) {
                    console.log('buffer validate worked')
                    const [key, iv] = Buffer.from(value.result, 'base64').toString('utf-8').split('-');
                    const keyBuff = Buffer.from(key, 'hex');
                    const ivBuff = Buffer.from(iv, 'hex');
                    QRDataValue = { keyBuff, ivBuff }
                }
            }
            QR.decode(bitmap);
            return QRDataValue;
        } catch (err) {
            throw new Error('ReadKeyError: ' + err.message);
        }
    }

    async generateQrKey(encryptedData, message) {
        const keyBuff = Buffer.from(encryptedData.key).toString('hex');
        const ivBuff = Buffer.from(encryptedData.iv).toString('hex');
        const secretKey = Buffer.from(keyBuff + '-' + ivBuff, 'utf-8').toString('base64');

        const icon = message.author.displayAvatarURL({
            format: 'png',
            dynamic: false,
            size: 2048
        });

        const qrImage = await this.createQrCanvas(secretKey, icon, 200, 70);
        const validateQRKey = await this.readKey(qrImage);
        if (!validateQRKey) {
            console.log('unreadable qr key', validateQRKey);
            // This will automatically regenerate if the QR key is unreadable for some reason.
            return this.generateQrKey(encryptedData, message);
        }
        return qrImage;
    }
}