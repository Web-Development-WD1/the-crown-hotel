const { Pool } = require('pg');
const config = {
    development: {
        user: 'syg23rnu',
        database: 'syg23rnu',
        password: 'TheirHardPut17*',
        host: 'cmpstudb-01.cmp.uea.ac.uk',
        port: '5432',
    },
    production: {
        user: '',
        database: '',
        password: '',
        host: 'cmpstudb-01.cmp.uea.ac.uk',
        port: '5432',
    },
};
const pool = new Pool(config[process.env.NODE_ENV || 'development']);

module.exports = pool;