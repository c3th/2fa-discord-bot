import getColors from 'get-image-colors'
import axios from 'axios';
import QRCode from 'qrcode';
import pkg from 'canvas'

const { loadImage, createCanvas } = pkg;

const options = {
    errorCorrectionLevel: 'H',
    quality: 0.95,
    margin: 5,
    color: {
        dark: '#000000',
        light: '#ffffff',
    },
}


export class Canvas {
    static roundedImageIcon(ctx, x, y, width, height, radius) {
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

    static getImageBrightness(icon) {
        const canvas = createCanvas(icon.width, icon.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(icon, 0, 0);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let colorSum = 0;
        let r, g, b, avg;

        for (let x = 0, len = data.length; x < len; x += 4) {
            r = data[x];
            g = data[x + 1];
            b = data[x + 2];

            avg = Math.floor((r + g + b) / 3);
            colorSum += avg;
        }

        const brightness = Math.floor(colorSum / (canvas.width * canvas.height));
        return brightness < 90 ? '#ffffff' : '#000000';
    }

    static getDomColor(icon) {
        return getColors(icon, 'image/png').then(colors => {
            const color = colors[0].hex('rgb');
            return color;
        });
    }

    static borderText(ctx, icon, fontColor, center, cwidth) {
        const text = 'SECRET';
        const size = 9;
        let height = 8;
        let width = 7;
        ctx.fillStyle = fontColor;
        ctx.font = size + "px Arial";
        for (var i = 0; i < 6; i++) {
            ctx.fillText(text, width, height);
            width += text.length + size * 4.5;
        }

        width = 7;
        height += 27 * 10 + 5;
        for (var i = 0; i < 6; i++) {
            ctx.fillText(text, width, height);
            width += text.length + size * 4.5;
        }

        ctx.clip();
        ctx.drawImage(icon, center, center, cwidth, cwidth);
    }

    static border(ctx, icon, color, width, height, center, cwidth) {
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = 18;
        ctx.strokeStyle = color;
        ctx.strokeRect(0, 0, width, height);
        const brightness = this.getImageBrightness(icon, width, height);
        this.borderText(ctx, icon, brightness, center, cwidth);
    }

    static async drawQRKeyImage(data, icon, width, cwidth) {
        const canvas = createCanvas(width, width);
        QRCode.toCanvas(canvas, data, options);
        const ctx = canvas.getContext('2d');
        const center = (canvas.width / 2) - cwidth / 2;
        const imageIcon = await loadImage(icon);
        const color = await this.getDomColor(icon);
        this.roundedImageIcon(ctx, center, center, cwidth, cwidth, 43);
        this.border(ctx, imageIcon, color, canvas.width, canvas.height, center, cwidth);
        return canvas.toBuffer();
    }
}