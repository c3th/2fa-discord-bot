import { Command } from '../../structures/Command.js'

import { MessageEmbed } from 'discord.js'


export class Codes extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Displays every code in a easy to read manor.',
            aliases: ['c', 'all'],
            verifiedKey: true,
            isUser: true
        });
    }

    async exec(msg) {
        const { key, iv } = this.cache.verified.get(msg.author.id);

        const items = await this.database.readEncrypted(key, iv, msg);
        const issuer = items.map(q => `${this.auth.parseOTP(q.otp).issuer} (${this.auth.parseOTP(q.otp).label})`)
        const codes = items.map(c => '> ' + this.auth.parseOTP(c.otp).generate());
        const progress = items.map(c => '> ' + Math.round(this.auth.generateOTPCode(this.auth.parseOTP(c.otp)).progress / 100) + 's');

        const embed = new MessageEmbed()
            .setColor('WHITE')
            .setAuthor({
                name: 'Dreams 2FA Services'
            })
            .setTitle(`Authorization codes for ${msg.author.username}`)
            .setThumbnail('https://i.bunkr.is/key-sfzOOieY.png')
            .addFields([
                { name: 'Issuer (user)', value: issuer.join('\n'), inline: true },
                { name: 'Code', value: codes.join('\n'), inline: true },
                { name: 'Time', value: progress.join('\n'), inline: true }
            ])

        return msg.channel.send({
            embeds: [embed]
        });
    }
}