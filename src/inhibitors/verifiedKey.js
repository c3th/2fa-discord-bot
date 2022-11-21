import { Inhibitor } from '../structures/Inhibitor.js'

import fse from 'fs-extra'
import path from 'path'


export class verifiedKey extends Inhibitor {
    constructor(...args) {
        super(...args, {});
    }

    exec(msg) {
        const users = path.join(this.__dirname, '/users/db/', msg.author.id + '.dd');
        if (fse.existsSync(users) && !this.cache.verified.has(msg.author.id)) {
            throw 'Please verify your key with `.verify`';
        }
    }
}