// eslint-disable-next-line @typescript-eslint/no-require-imports,no-undef
const dotenv = require('dotenv');

// eslint-disable-next-line no-undef
process.env.NODE_ENV = 'development';
dotenv.config({ path: '.development.env' });
