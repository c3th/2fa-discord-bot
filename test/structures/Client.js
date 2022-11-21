import { Client, Collection } from 'discord.js'

import { Dispatch } from './Dispatch.js';

import { Encryption } from '../utils/Encryption.js'
import { Auth } from '../utils/Auth.js'
import { Util } from '../utils/Util.js'
import { Qr } from '../utils/Qr.js'

export class DreamClient extends Client {
    constructor(config) {
        super({
            intents: [
                'GUILDS',
                'GUILD_MESSAGES'
            ]
        });

        this.token = config.token;
        this.prefix = config.prefix;

        this.cache = new Collection();
        this.commands = new Collection();
        this.inhibitors = new Collection();
        this.events = new Collection();

        this.auth = new Auth(this);
        this.encryption = new Encryption(this);
        this.qr = new Qr(this);
        this.util = new Util(this);
        this.dispatch = new Dispatch(this);

        super.once('ready', () => {
            this.user.setPresence({
                activities: [{
                    name: 'over 2fa codes',
                    type: 'WATCHING'
                }],
                status: 'idle'
            });
            console.log(`Authorized as ${this.user.username} (${this.user.id})`);
        });

        this.login(this.token);
    }
}