export class Inhibitor {
    constructor(client, config) {
        this.client = client;

        this.util = this.client.util;
        this.auth = this.client.auth;
        this.cache = this.client.cache;
        this.qr = this.client.qr;

        this.name = config.name;
    }
}