import { Command } from '../../structures/Command.js'


export class Verify extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Verify your key when registrating new accounts.',
            aliases: 'v',
            requestImage: true
        });
    }

    async exec(msg) {
        const attachmentURL = msg.embeds[0];
        const attachment = msg.attachments.first();
        const proxyURL = attachment ? attachment.proxyURL : attachmentURL && attachmentURL.type === 'image'
            ? attachmentURL.thumbnail.proxyURL : null

        const qrImageData = await this.reader.readQRAndReturn(proxyURL)
            .catch(O_o => { });

        if (qrImageData?.key) {
            const { key, iv } = qrImageData;
            const verifyKey = await this.database.readEncrypted(key, iv, msg);

            const isUser = this.cache.verified.has(msg.author.id);
            if (verifyKey && !isUser) {
                await this.cache.verified.set(msg.author.id, {
                    key,
                    iv
                });
                return msg.channel.send('Key was successfully verified, you may register new accounts.');
            } else if (isUser) {
                return msg.channel.send('Key has already been verified, you can destroy session by using `.end`');
            }

            return msg.channel.send('Invalid key was detected.');
        }
    }
}