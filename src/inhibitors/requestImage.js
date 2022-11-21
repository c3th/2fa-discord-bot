import { Inhibitor } from '../structures/Inhibitor.js'


export class requestImage extends Inhibitor {
    constructor(...args) {
        super(...args, {});
    }

    exec(msg) {
        if (msg.embeds.length <= 0 && msg.attachments.size <= 0) {
            throw 'Please attach the QR code you want to submit.';
        } else if (msg.attachments.size > 2 || msg.embeds.length > 2) {
            throw 'One at a time, please!';
        }
    }
}