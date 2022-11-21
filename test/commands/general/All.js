import { Command } from "../../structures/Command.js"

import { MessageEmbed } from "discord.js"

export class All extends Command {
    constructor(...args) {
        super(...args, {
            description: 'View all codes',
            registerQrKey: true
        });
    }

    async exec(msg) {
        const { codes } = this.cache.get(msg.author.id);

        const embed = new MessageEmbed()
            .setColor('WHITE')
            .setAuthor({
                name: 'Dreams 2FA Services'
            })
            .setTitle(`Authorization codes for ${msg.author.username}`)
            .setThumbnail('https://i.bunkr.is/key-sfzOOieY.png')
            .addFields([
                { name: 'Issuer (user)', value: codes.map(q => `${q.issuer} (${q.user})`).join('\n'), inline: true },
                { name: 'Code', value: codes.map(q => '> ' + (this.auth.generateOTPCode(this.auth.parseOTP(q.url)).token || 'Errr')).join('\n'), inline: true },
                { name: 'Time', value: codes.map(q => '> ' + Math.round(this.auth.generateOTPCode(this.auth.parseOTP(q.url)).progress / 100) + 's').join('\n'), inline: true }
            ])

        return msg.channel.send({
            embeds: [embed]
        });
    }
}