require('pg').defaults.parseInt8 = true;

module.exports = {
    dialect: 'postgres',
    dialectOptions: {
        ssl: '1' === process.env.DATABASE_SSL,
    },
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    define: {
        freezeTableName: true,
        underscored: true,
    },
    pool: {
        max: 5,
        min: 0,
        idle: 60000,
        evict: 60000,
        acquire: 60000,
    },
    // we don't want to log options
    logging: (query) => console.info(query),
};
