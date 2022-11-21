import { Command } from "../../structures/Command.js"

import { MessageEmbed } from "discord.js"


export class About extends Command {
    constructor(...args) {
        super(...args, {
            description: 'About this bot',
            aliases: 'ab'
        });
    }

    async exec(msg) {
        const developer = this.client.users.cache.get('144187884587450369');

        const embed = new MessageEmbed()
            .setColor('WHITE')
            .setAuthor({
                name: 'Dreams 2FA Services'
            })
            .setThumbnail(this.client.user.displayAvatarURL({
                format: 'png',
                size: 128,
                dyanmic: false
            }))
            .setTitle(`About us and ${this.client.user.username}`)
            .setDescription([
                ['• *Our databases are selfhosted and encrypted for users safety.*'],
                ['• *We are using a fast and effective encryption algorithm with a randomly generated key and initialization vector.*'],
                ['• *Our encryption automatically generates a secret QR key that the user will be able to use for easy access. Further more, the key is only registered to the users account for extra security.*'],
                ['• *Our services also refresh encryption and key upon every new registered account. This is good because it keeps the key new and harder to crack.*'],
                ['• *Our services was officially made for the simplicity and efficiency for safe keeping two factor authorization codes. With easy access using a QR key that is automatically read by the bot, to verify the ownership of the stored data.*'],
                ['• *While our services are privated at the moment, we soon intend to, release it to the public.*']
            ].join('\n'))
            .addFields([
                { name: 'Developer', value: developer.tag, inline: true },
            ])

        return msg.channel.send({
            embeds: [embed]
        })
    }
}