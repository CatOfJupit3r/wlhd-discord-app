import { Command, CommandCollection, Event, EventCollection, iDiscordClient } from '@typing/typedefs';
import { ApplicationCommand, Client, Collection, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';

class DiscordClient extends Client implements iDiscordClient {
    public readonly commands: CommandCollection;
    private readonly deprecated: Array<string>;

    constructor({ deprecated = [] }: { deprecated?: Array<string> } = {}) {
        super({
            // Please add all intents you need, more detailed information @ https://ziad87.net/intents/
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Partials.Channel],
        });

        this.commands = new Collection();
        this.deprecated = deprecated;
    }

    public connect = async (token: string) => {
        await this.login(token);
    };

    public attachEvents = (events: Array<Event>) => {
        const eventCollection = this.transformEventsArrayToCollection(events);
        eventCollection.forEach(({ execute, once = false }, key) => {
            if (once) {
                // @ts-expect-error produces union type too complex bruuuh
                this.once(key, (...args) => execute(this, ...args));
            } else {
                this.on(key, (...args) => execute(this, ...args));
            }
            console.log(`Event ${key} attached successfully!`);
        });
    };

    public attachCommands = async (commands: CommandCollection) => {
        commands.forEach((command, key) => {
            this.commands.set(key, command);
            console.log(`Command ${key} attached successfully!`);
        });
    };

    public refreshCommands = async ({ clientID, discordToken }: { clientID: string; discordToken: string }) => {
        const rest = new REST().setToken(discordToken);

        const existing = await this.getExistingAndRemoveDeprecated(rest, clientID);

        const commands = this.commands
            .map((command: Command) => ({
                ...command.built.toJSON(),
                ...(command.externalFields ?? {}),
            }))
            .concat(existing.filter(({ name }) => !this.commands.has(name)));

        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = (await rest.put(Routes.applicationCommands(clientID), { body: commands })) as Array<never>;

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    };

    private getExistingAndRemoveDeprecated = async (rest: REST, clientID: string) => {
        const existingCommands = (await rest.get(Routes.applicationCommands(clientID))) as Array<ApplicationCommand>;

        const deprecatedCommands = existingCommands.filter(({ name }) => this.deprecated.includes(name));

        console.log(`Found ${deprecatedCommands.length} deprecated commands.`);

        for (const command of deprecatedCommands) {
            await rest.delete(Routes.applicationCommand(clientID, command.id));
            console.log(`Deleted ${command.name} command.`);
        }

        console.log(`Successfully deleted ${deprecatedCommands.length} deprecated commands.`);

        return existingCommands.filter(({ name }) => !this.deprecated.includes(name)) as Array<
            ReturnType<Command['built']['toJSON']>
        >;
    };

    private transformEventsArrayToCollection = (events: Array<Event>): EventCollection => {
        const eventCollection: EventCollection = new Collection();
        events.forEach(({ name, ...event }) => {
            eventCollection.set(name, event);
        });
        return eventCollection;
    };
}

export default DiscordClient;
