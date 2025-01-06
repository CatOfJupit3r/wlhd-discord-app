import DiscordClient from '@models/DiscordClient';
import commands from '../commands';
import events from '../events';

export default async () => {
    const client = new DiscordClient({
        // deprecated: ['launch']
    });
    await client.attachCommands(commands);
    client.attachEvents(events);

    return client;
};
