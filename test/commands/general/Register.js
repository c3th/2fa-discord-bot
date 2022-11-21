import { MessageEmbed, MessageAttachment } from 'discord.js'

import { Command } from '../../structures/Command.js'


export class Register extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Register your 2fa codes here',
            aliases: ['reg'],
            registerQrKey: true,
        });
    }

    async exec(msg, args) {
        try {
            const attachmentURL = msg.embeds[0];
            const attachment = msg.attachments.first();
            const proxyURL = attachment ? attachment.proxyURL : attachmentURL && attachmentURL.type === 'image'
                ? attachmentURL.thumbnail.proxyURL : null

            const detectedOTPEmbed = new MessageEmbed()
                .setColor('WHITE')
                .setAuthor({ name: 'Dreams 2FA Services' })
                .setTitle('Types of entries')
                .setDescription('**Note:** *All these examples works with `.register`*')
                .setThumbnail('https://i.bunkr.is/key-sfzOOieY.png')
                .addFields([
                    { name: 'QR Image', value: 'Attached QR image or url to an image, note, url\'s may need to be registered twice if not recognised properly.', inline: false },
                    { name: 'TOTP URL', value: 'otpauth://totp/Dreams:email?secret=||secret||&issuer=Dreams', inline: false },
                    { name: 'Command line', value: 'issuer=Dreams | secret=otp_secret | label=email', inline: false }
                ])
                .setFooter({ text: 'Please read more on .about' })

            const detectedOTP = await this.auth.detectOTP(proxyURL, args);
            if (!detectedOTP) return msg.channel.send({
                embeds: [detectedOTPEmbed]
            });
            console.log('detected otp', detectedOTP);

            const secretKey = await this.util.writeEncryptedFile(detectedOTP, msg);
            const fileImage = new MessageAttachment(secretKey, 'secretkey.png');
            const code = this.auth.generateOTPCode(detectedOTP);
            // const isRegistered = this.cache.has(msg.author.id);

            const embed = new MessageEmbed()
                .setColor('WHITE')
                .setAuthor({ name: 'Dreams 2FA Services' })
                .setTitle('Detected new registration')
                .setThumbnail('attachment://secretkey.png')
                .addFields([
                    { name: 'Issuer (user)', value: `${detectedOTP.issuer} (${detectedOTP.label})`, inline: true },
                    { name: 'Token', value: '> ' + code.token, inline: true },
                    { name: 'Time', value: '> ' + Math.round(code.progress / 100) + 's', inline: true },
                ])
                .setFooter({
                    text: 'Please read more on .about'
                })

            return msg.channel.send({
                content: '**Note:** *Mind the QR code, this is your key for future registrations. This code changes as you register new accounts.*',
                files: [fileImage],
                embeds: [embed]
            });
        } catch (err) {
            return msg.channel.send(err.message);
        }
    }
}