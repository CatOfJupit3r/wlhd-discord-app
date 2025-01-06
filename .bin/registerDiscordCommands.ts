import './loadDevEnv';

import commands from '../src/commands';
import { env } from '../src/configs';
import DiscordClient from '../src/models/DiscordClient';

(async () => {
    const client = new DiscordClient();
    await client.attachCommands(commands);
    await client.refreshCommands({
        clientID: env.DISCORD_BOT_CLIENT_ID,
        discordToken: env.DISCORD_TOKEN,
    });
})().then(
    () => {
        process.exit(0);
    },
    (error) => {
        console.error(error);
        process.exit(1);
    }
);
