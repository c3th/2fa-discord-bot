export class Command {
    constructor(client, data) {
        this.name = data.name;
        this.description = data.description;
        this.aliases = data.aliases;
        this.dir = data.dir;

        this.client = client;

        this.__dirname = this.client.__dirname;

        this.auth = this.client.auth;
        this.reader = this.client.reader;
        this.encryption = this.client.encryption;
        this.database = this.client.database;
        this.cache = this.client.cache;
        Object.keys(data).forEach(key => this[key] = data[key]);
    }
}