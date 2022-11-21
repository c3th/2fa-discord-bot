import { Inhibitor } from '../structures/Inhibitor.js'

import fse from 'fs-extra'
import path from 'path'

export class registerQrKey extends Inhibitor {
    constructor(...args) {
        super(...args, {});
    }

    exec(msg) {
        const user = msg.author.id + '.db';
        const userPath = path.join(this.util.parseDirPath('./assets/db'), '/' + user);
        if (fse.existsSync(userPath) && !this.cache.has(msg.author.id)) {
            throw 'Please `.submit` your QR key that you received upon registering.';
        }
    }
}