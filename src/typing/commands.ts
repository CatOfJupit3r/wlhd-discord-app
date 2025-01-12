import { Collection } from 'discord.js';
import { iMultipleRollResults } from '../lib/game';

export interface RollParticipant {
    userId?: string;
    descriptor: string;
    channelId?: string;
    attributeBonus?: number;

    mustRollToSucceed: number;
    dice: {
        amount: number;
        sides: number;
    };
    hasRolled: boolean;
    timesToThrow: number;
    result: iMultipleRollResults | null;
}

export enum SecretMode {
    KEEP_IN_CHANNEL = 'keepInChannel', // roll results are only displayed in character channels (or where they were rolled)
    REVEAL_AT_END = 'revealAtEnd', // roll results are only displayed in the end of the session
    REGULAR = 'regular', // roll results are displayed both in the end of the session and in character channels during session
}

export interface iRollSession {
    participants: RollParticipant[];
    timer: number;
    secret: SecretMode;
    channelId: string;
    messageId?: string; // To track the embed message

    context: iRollSessionContext;
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

export interface iRollSessionContext {
    shared: iSharedContext;
    addCharacter: iAddCharacterContext;
}

export interface iAddCharacterContext {
    tab: number;
}

export interface iSharedContext {
    characters?: iCharacterInfo[];

    diceSides: number;
    valueToRoll: number;
    attribute: string;
}
