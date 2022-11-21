import { MessageEmbed, MessageAttachment } from 'discord.js'

import { Command } from '../../structures/Command.js'


export class Read extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Reads and registers a QR code.',
            aliases: 'r',
            requestImage: true,
            verifiedKey: true
        });
    }

    async exec(msg) {
        const attachmentURL = msg.embeds[0];
        const attachment = msg.attachments.first();
        const proxyURL = attachment ? attachment.proxyURL : attachmentURL && attachmentURL.type === 'image'
            ? attachmentURL.thumbnail.proxyURL : null

        const qrImageData = await this.reader.readQRAndReturn(proxyURL)
            .catch(O_o => { });

        if (!qrImageData) return msg.channel.send('Invalid OTP was detected.');

        if (qrImageData.key) return msg.channel.send('Keys does not work for registrations, dummy.');

        const code = this.auth.generateOTPCode(qrImageData);

        const addedEmbed = new MessageEmbed()
            .setColor('WHITE')
            .setAuthor({ name: 'Dreams 2FA Services' })
            .setTitle('Detected new registration')
            .addFields([
                { name: 'Issuer (user)', value: `${qrImageData.issuer} (${qrImageData.label})`, inline: true },
                { name: 'Token', value: '> ' + code.token, inline: true },
                { name: 'Time', value: '> ' + Math.round(code.progress / 100) + 's', inline: true },
            ])
            .setFooter({
                text: 'Please read more on .about'
            })

        const { key, iv, items } = await this.database.addItems(msg, {
            otp: qrImageData.toString(),
            date: Date.now()
        });

        const writtenData = this.database.writeEncrypted(msg, items, key, iv);
        if (!writtenData.key) return msg.channel.send({
            embeds: [addedEmbed]
        });

        const encodedKey = this.auth.encodeKey(writtenData.key, writtenData.iv);
        const generatedKey = await this.reader.generateQRKey(encodedKey, msg);

        const fileImage = new MessageAttachment(generatedKey, 'secretkey.png');

        const embed = new MessageEmbed()
            .setColor('WHITE')
            .setAuthor({ name: 'Dreams 2FA Services' })
            .setTitle('Detected new registration')
            .setThumbnail('attachment://secretkey.png')
            .addFields([
                { name: 'Issuer (user)', value: `${qrImageData.issuer} (${qrImageData.label})`, inline: true },
                { name: 'Token', value: '> ' + code.token, inline: true },
                { name: 'Time', value: '> ' + Math.round(code.progress / 100) + 's', inline: true },
            ])
            .setFooter({
                text: 'Please read more on .about'
            })

        return msg.channel.send({
            // content: '**Note:** *Mind the QR code, this is your key for future registrations. This code changes as you register new accounts.*',
            files: [fileImage],
            embeds: [embed]
        });
    }
}