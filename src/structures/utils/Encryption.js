import crypto from 'crypto'


export class Encryption {
    constructor(client) {
        this.client = client;

        this.algorithm = 'aes-256-cbc';
        this.key = crypto.randomBytes(32);
        this.iv = crypto.randomBytes(16);
    }

    cipher(data, key, iv) {
        if (!key) key = this.key;
        if (!iv) iv = this.iv;
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        let encryption = cipher.update(data, 'utf-8', 'hex');
        encryption += cipher.final('hex');
        return {
            encryption,
            key,
            iv
        }
    }

    decipher(cipher, key, iv) {
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
        let decryption = decipher.update(cipher, 'hex', 'utf-8');
        decryption += decipher.final('utf-8');
        return decryption;
    }
}