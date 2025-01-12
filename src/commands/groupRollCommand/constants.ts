import { createCommandIdFactory } from '@utils';

export const commandName = 'start-group-roll';

const localCommandId = createCommandIdFactory(commandName);

const commandIds = {
    START_ROLL: localCommandId('start_roll'),
    CANCEL_ROLL: localCommandId('cancel_roll'),
    ADD_CHARACTER: localCommandId('add_character'),
    USE_PRESET: localCommandId('use_preset'),
    SETTINGS: localCommandId('settings'),
};

export { commandIds };
