import { config } from 'dotenv';
import * as fs from 'node:fs';
import { z } from 'zod';

switch (process.env.NODE_ENV) {
    case 'test':
    case 'production': {
        if (fs.existsSync(`.${process.env.NODE_ENV}.env`)) {
            config({ path: `.bin/config/.${process.env.NODE_ENV}.env` });
        }
        // else, we assume they are passed to by container
        // e.g. Heroku, Docker, etc.
        break;
    }
    case 'development':
        console.log('Using .development.env file');
        config({ path: '.bin/config/.development.env' });
        break;
    default:
        throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}.`);
}

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DISCORD_TOKEN: z.string(),
    ADMIN_USER_ID: z.string(),
    DISCORD_BOT_CLIENT_ID: z.string(),
    TEST_GUILD_ID: z.string(),
});

// or use import.meta.env if you are using Vite
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('Environment variable validation failed:', _env.error.format());
    process.exit(1);
}

export default _env.data;
