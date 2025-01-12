import {
    ButtonInteraction,
    Client,
    ClientEvents,
    Collection,
    CommandInteraction,
    ModalSubmitInteraction,
    SlashCommandBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';
import { GroupRollSessions } from './commands';

type EventMap = {
    [K in keyof ClientEvents]: {
        name: K;
        once?: boolean;
        execute: (client: iDiscordClient, ...args: ClientEvents[K]) => Promise<void>;
    };
};

// Create a union of all possible events
export type Event = EventMap[keyof EventMap];

export interface Command {
    built: SlashCommandBuilder;
    autocomplete?: (interaction: any) => Promise<void>; // You can replace `any` with the appropriate type for interactions
    externalFields?: Record<string, any>;
    handleCommand: (client: iDiscordClient, interaction: CommandInteraction) => Promise<void>; // You can replace `any` with the appropriate type for interactions
    handleButton?: (client: iDiscordClient, interaction: ButtonInteraction) => Promise<void>;
    handleModalSubmit?: (client: iDiscordClient, interaction: ModalSubmitInteraction) => Promise<void>;
    handleSelectMenu?: (client: iDiscordClient, interaction: StringSelectMenuInteraction) => Promise<void>;
}

export type CommandCollection = Collection<string, Command>;
export type EventCollection = Collection<string, Omit<Event, 'name'>>;

export interface iDiscordClient extends Client {
    commands: CommandCollection;
    attachEvents: (events: Array<Event>) => void;
    attachCommands: (commands: CommandCollection) => void;

    rollSessions: GroupRollSessions;
}
