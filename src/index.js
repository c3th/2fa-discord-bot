import { config } from 'dotenv'
config();

import { DreamClient } from './structures/Client.js'

import { fileURLToPath } from 'url';
import path from 'path'
import fse from 'fs-extra'

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const client = new DreamClient({
    prefix: process.env['PREFIX'],
    token: process.env['TOKEN'],
    __dirname
});

const commandPath = path.join(__dirname, './commands');
fse.readdirSync(commandPath).forEach(dir => {
    fse.readdirSync(commandPath + '/' + dir).forEach(async file => {
        const pull = await import('file://' + commandPath + '/' + dir + '/' + file);
        const pop = Object.values(pull).pop();
        const command = new pop(client);
        command.name = pop.name.toLowerCase();
        command.dir = dir;
        client.cache.commands.set(command.name, command);
    });
});


const inhibitorPath = path.join(__dirname, './inhibitors');
fse.readdirSync(inhibitorPath).forEach(async file => {
    const pull = await import('file://' + inhibitorPath + '/' + file);
    const pop = Object.values(pull).pop();
    const inhibitor = new pop(client);
    inhibitor.name = pop.name;
    client.cache.inhibitors.set(inhibitor.name, inhibitor);
});


client.login();