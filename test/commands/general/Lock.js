import { Command } from "../../structures/Command.js"

import { MessageEmbed } from "discord.js"

export class Lock extends Command {
    constructor(...args) {
        super(...args, {
            description: 'View all codes',
            aliases: ['end'],
            registerQrKey: true
        });
    }

    async exec(msg) {
        await this.cache.delete(msg.author.id);
        return msg.channel.send('Session has successfully been revoked.');
    }
}