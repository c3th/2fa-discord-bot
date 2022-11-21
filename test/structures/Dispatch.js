export class Dispatch {
    constructor(client) {
        this.client = client;
        this.prefix = this.client.prefix;
        this.commands = this.client.commands;

        this.client.on('messageCreate', this.dispatchMessage.bind(this));
    }

    dispatchMessage(msg) {
        if (!msg.content.startsWith(this.prefix)) return;
        if (msg.author.bot || msg.channel.type === 'dm') return;

        const args = msg.content.slice(this.prefix.length).trim().split(/ +/g);
        const pull = args.shift().toLowerCase();
        const command = this.commands.find(cmd => cmd.name === pull
            || cmd.aliases.includes(pull));

        for (const inhibitorKey of Array.from(this.client.inhibitors.keys())) {
            if (command && Object.keys(command).includes(inhibitorKey)) {
                const inhibitor = this.client.inhibitors.get(inhibitorKey);
                if (command[inhibitorKey]) {
                    try {
                        if (inhibitor) inhibitor.exec(msg, args, command);
                    } catch (err) {
                        return msg.channel.send(err);
                    }
                }
            }
        }

        try {
            if (command) command.exec(msg, args);
        } catch (err) {
            console.log('dispatcher', err);
        }
    }
}