

// dreams 2fa services by matt


import jetpack from 'fs-jetpack';
import fse from 'fs-extra'

import { DreamClient } from './structures/Client.js'


const client = new DreamClient({
    token: process.env['TOKEN'],
    prefix: process.env['PREFIX']
});

const commandPath = client.util.parseDirPath('./commands');
fse.readdirSync(commandPath).forEach(dir => {
    jetpack.find(commandPath + '/' + dir, { matching: '*.js' }).forEach(async file => {
        const pull = await import(client.util.parseFilePath(file));
        const pop = Object.values(pull).pop();
        const command = new pop(client);
        command.name = pop.name.toLowerCase();
        command.dir = dir;
        client.commands.set(command.name, command);
    });
});

const inhibitorPath = client.util.parseDirPath('./inhibitors');
jetpack.find(inhibitorPath, { matching: '*.js' }).forEach(async file => {
    const pull = await import(client.util.parseFilePath(file));
    const pop = Object.values(pull).pop();
    const inhibitor = new pop(client);
    inhibitor.name = pop.name;
    client.inhibitors.set(inhibitor.name, inhibitor);
});