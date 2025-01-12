import { Collection } from 'discord.js';

export interface RollParticipant {
    userId?: string;
    descriptor: string;
    channelId?: string;
    attributeBonus?: number;
    hasRolled: boolean;
    result: number | null;
}

export enum SecretMode {
    KEEP_IN_CHANNEL = 'keepInChannel',
    REVEAL_AT_END = 'revealAtEnd',
    REGULAR = 'regular',
}

export interface iRollSession {
    participants: RollParticipant[];
    timer: number;
    secret: SecretMode;
    createdAt: Date;
    channelId: string;
    initiator: string;
    messageId?: string; // To track the embed message

    context: {
        addCharacter: iAddCharacterContext;
    };
}

export type GroupRollSessions = Collection<string, iRollSession>;

export interface iCharacterInfo {
    descriptor: string;
    decorations: {
        name: string;
        description: string;
        sprite: string;
    };
    userId?: string;
    channelId?: string;
    attributeBonus?: number;
}

export interface iAddCharacterContext {
    tab: number;
    characters?: iCharacterInfo[];
}
