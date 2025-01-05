import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// or use import.meta.env if you are using Vite
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('Environment variable validation failed:', _env.error.format());
    process.exit(1);
}

export default _env.data;
