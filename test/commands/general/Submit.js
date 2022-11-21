import { Command } from "../../structures/Command.js"

import { MessageEmbed } from "discord.js"

export class Submit extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Submit your QR key for 5 minutes of registering new acocunts and viewing codes',
            aliases: ['s'],
            attachImage: true
        });
    }

    async exec(msg) {
        try {
            const embed = new MessageEmbed()
                .setColor('WHITE')
                .setDescription('**Note:** *When registering new accounts it will regenerate a new secret QR key that will replace your old QR key.*')

            const attachmentURL = msg.embeds[0];
            const attachment = msg.attachments.first();
            const proxyURL = attachment ? attachment.proxyURL : attachmentURL && attachmentURL.type === 'image'
                ? attachmentURL.thumbnail.proxyURL : null

            const qr = await this.qr.readKey(proxyURL);
            if (!Object.keys(qr).length) {
                return msg.channel.send('QR was not detected as a key, please try again.');
            }
            console.log('submitted qr key', qr);
            if (this.cache.has(msg.author.id)) {
                return msg.channel.send('QR was detected as a key, which has already been verified.');
            }

            if (qr.keyBuff && qr.ivBuff) {
                const codes = await this.util.readEncryptedFile(qr, msg);
                console.log('codes for user', codes);
                await this.cache.set(msg.author.id, {
                    date: Date.now(),
                    codes
                });
                return msg.channel.send('Key was successfully verified, you may register new accounts and view your codes.', {
                    embeds: [embed]
                });
            }
        } catch (err) {
            return msg.channel.send(err.message);
        }
    }
}