import fse from 'fs-extra'
import path from 'path'


export class Database {
    constructor(client) {
        this.client = client;

        this.__dirname = this.client.__dirname;
        this.encryption = this.client.encryption;
        this.cache = this.client.cache;

        this.users = path.join(this.__dirname, '/users/db');
    }

    addItems(message, data) {
        const users = path.join(this.users, message.author.id + '.dd');
        let items = [];

        const verifiedUser = this.client.cache.verified.get(message.author.id);
        if (fse.existsSync(users) && this.client.cache.verified.has(message.author.id)) {
            const { key, iv } = this.client.cache.verified.get(message.author.id);
            const storedItems = this.readEncrypted(key, iv, message);
            storedItems.push(data);
            items = storedItems;
        } else {
            items.push(data);
        }

        return {
            key: verifiedUser ? verifiedUser.key : null,
            iv: verifiedUser ? verifiedUser.iv : null,
            items
        }
    }

    writeEncrypted(message, items, usedKey = null, usedIv = null) {
        const users = path.join(this.users, message.author.id + '.dd');
        try {
            console.log(usedKey, usedIv);
            const { encryption, key, iv } = this.client.encryption.cipher(
                JSON.stringify(items),
                usedKey,
                usedIv
            );

            fse.writeFileSync(users, encryption);
            return { key, iv }
        } catch (err) {
            throw new Error('WriteEncryptedError: ' + err.message);
        }
    }

    readEncrypted(key, iv, message) {
        try {
            const data = fse.readFileSync(
                path.join(this.users, message.author.id + '.dd')
            );
            const decrypted = this.client.encryption.decipher(data.toString('utf-8'), key, iv);
            return JSON.parse(decrypted);
        } catch (err) {
            console.log('ReadEncryptedError', err);
        }
    } s
}