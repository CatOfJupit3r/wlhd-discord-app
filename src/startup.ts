import { env } from '@configs';
import RootLoader from './loaders';

const start = async () => {
    try {
        const client = await RootLoader();

        await client.connect(env.DISCORD_TOKEN);
        console.log(`
    #############################################
        Discord client connected successfully! 🚀
    #############################################
    `);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default start;
