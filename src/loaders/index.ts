import clientLoader from './clientLoader';
import translationsLoader from './translationsLoader';

const RootLoader = async () => {
    console.log('Starting root loader...');

    console.log('Starting translations loader...');
    await translationsLoader();
    console.log('Translations loader finished successfully!');

    console.log('Starting client loader...');
    const client = await clientLoader();
    console.log('Client loader finished successfully!');

    console.log('Root loader finished successfully!');
    return client;
};

export default RootLoader;
