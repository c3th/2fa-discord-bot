import { Command } from "../../structures/Command.js"


export class End extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Destroys current session.',
            aliases: ['lock'],
            registerQrKey: true
        });
    }

    async exec(msg) {
        await this.cache.verified.delete(msg.author.id);
        return msg.channel.send('Session was revoked.');
    }
}