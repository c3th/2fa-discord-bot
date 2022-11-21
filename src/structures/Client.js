import { Client } from 'discord.js'

import { Database } from './utils/Database.js'
import { Encryption } from './utils/Encryption.js'
import { Reader } from './utils/QR.js'
import { Auth } from './utils/Auth.js'

import { Dispatch } from './Dispatch.js'
import { Cache } from './Cache.js'

export class DreamClient extends Client {
    constructor(config) {
        super({
            intents: [
                'GUILDS',
                'GUILD_MESSAGES'
            ]
        });

        this.__dirname = config.__dirname;
        this.prefix = config.prefix;
        this.token = config.token;

        this.cache = new Cache();

        this.auth = new Auth(this);
        this.database = new Database(this);
        this.reader = new Reader(this);
        this.encryption = new Encryption(this);

        this.dispatch = new Dispatch(this);
    }

    login() {
        return super.login(this.token);
    }
}