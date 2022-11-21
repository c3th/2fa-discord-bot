import { Collection } from 'discord.js'


export class Cache {
    constructor() {
        this.commands = new Collection();
        this.inhibitors = new Collection();
        this.verified = new Collection();
    }
}