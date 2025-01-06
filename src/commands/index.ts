import { CommandCollection } from '@typing/typedefs';
import { Collection } from 'discord.js';

import gameCommands from './gameCommands';
import masterCommands from './masterCommands';
import userCommands from './userCommands';

const indexCommands: CommandCollection = new Collection();

[gameCommands, userCommands, masterCommands].forEach((commands) => {
    commands.forEach((command) => {
        indexCommands.set(command.built.name, command);
    });
});

export default indexCommands;
