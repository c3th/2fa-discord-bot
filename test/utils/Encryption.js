import crypto from 'crypto'

const algorithm = 'aes-256-cbc';

class EncryptedData {
    constructor(data) {
        this.data = data.encryption || null;
        this.key = data.key || crypto.randomBytes(32);
        this.iv = data.iv || crypto.randomBytes(16);
    }
}

export class Encryption {
    constructor(client) {
        this.client = client;
    }

    // cipherWithKey(data, userKey, userIV) {
    //     const cipher = crypto.createCipheriv(algorithm, userKey, userIV);
    //     let encryption = cipher.update(data, 'utf-8', 'hex');
    //     encryption += cipher.final('hex');
    //     return new EncryptedData(encryption, { userKey, userIV });
    // }

    cipher(data, key, iv) {
        console.log('new data to cipher', data)
        const encryptedData = new EncryptedData({ key, iv });
        console.log(key && iv ? 'using old key' : 'using new key');
        const cipher = crypto.createCipheriv(algorithm, encryptedData.key, encryptedData.iv);
        let encryption = cipher.update(data, 'utf-8', 'hex');
        encryption += cipher.final('hex');
        encryptedData.data = encryption;
        console.log('final encrypted data', encryptedData);
        return encryptedData;
    }

    decipher(cipher, cipherKey, cipherIv) {
        const decipher = crypto.createDecipheriv(algorithm, cipherKey, cipherIv);
        let decryption = decipher.update(cipher, 'hex', 'utf-8');
        decryption += decipher.final('utf-8');
        return decryption;
    }
}