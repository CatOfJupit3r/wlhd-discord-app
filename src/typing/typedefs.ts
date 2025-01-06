import { Client, ClientEvents, Collection, CommandInteraction, SlashCommandBuilder } from 'discord.js';

type EventMap = {
    [K in keyof ClientEvents]: {
        name: K;
        once?: boolean;
        execute: (client: Client, ...args: ClientEvents[K]) => Promise<void>;
    };
};

// Create a union of all possible events
export type Event = EventMap[keyof EventMap];

export interface Command {
    built: SlashCommandBuilder;
    execute: (interaction: any) => Promise<void>; // You can replace `any` with the appropriate type for interactions
    externalFields?: Record<string, any>;
}

export type CommandCollection = Collection<string, Command>;
export type EventCollection = Collection<string, Omit<Event, 'name'>>;

export interface iDiscordClient extends Client {
    commands: CommandCollection;
    attachEvents: (events: Array<Event>) => void;
    attachCommands: (commands: CommandCollection) => void;
}

export interface ActivityCommand extends Command {
    built: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}
