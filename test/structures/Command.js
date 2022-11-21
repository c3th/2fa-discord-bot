export class Command {
    constructor(client, config) {
        this.client = client;

        this.util = this.client.util;
        this.auth = this.client.auth;
        this.cache = this.client.cache;
        this.qr = this.client.qr;

        this.name = config.name;
        this.description = config.description;
        this.aliases = config.aliases || [];
        this.dir = config.dir;
        Object.keys(config).forEach(key => this[key] = config[key]);
    }
}
