import { Command } from '../../structures/Command.js'

import { MessageEmbed, MessageAttachment } from 'discord.js'


export class Refresh extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Refreshes your key.',
            aliases: ['new'],
            isUser: true,
            verifiedKey: true
        });
    }

    async exec(msg) {
        let { key, iv } = this.cache.verified.get(msg.author.id);
        const items = await this.database.readEncrypted(key, iv, msg);

        const writtenData = await this.database.writeEncrypted(msg, items);

        const encodedKey = this.auth.encodeKey(writtenData.key, writtenData.iv);
        const generatedKey = await this.reader.generateQRKey(encodedKey, msg);
        await this.cache.verified.delete(msg.author.id);

        const fileImage = new MessageAttachment(generatedKey, 'secretkey.png');

        const embed = new MessageEmbed()
            .setColor('WHITE')
            .setAuthor({ name: 'Dreams 2FA Services' })
            .setTitle('Your new key')
            .setImage('attachment://secretkey.png')

        return msg.channel.send({
            // content: '**Note:** *Mind the QR code, this is your key for future registrations. This code changes as you register new accounts.*',
            files: [fileImage],
            embeds: [embed]
        });
    }
}