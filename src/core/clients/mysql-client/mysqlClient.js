const mysql = require('mysql2/promise');
const appLogger = require('../../logger/appLogger');
const configSchema = require('./configSchema');

let pool = null;

module.exports.getMySqlClient = () => {
    if (pool === null) {
        throw new Error('MySqlClient not initialized.');
    }

    return pool;
};

module.exports.mySqlClientHealthcheck = async () => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        return 'mySqlClient OK';
    } catch (e) {
        appLogger.error(`mySqlClientHealthcheck error: ${e.message}`, e);
        return 'mySqlClient ERROR';
    }
}

module.exports.setup = async (config) => {

    const {error, value} = configSchema.validate(config || {});

    if (error) {
        throw new Error('MySql configuration validation error');
    }

    pool = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    });

    pool.on('error', (err) => {
        appLogger.error('onerror event fired', err);
    });

    pool.on('connection', (connection) => appLogger.info('MySql pool:on connection'));
    pool.on('acquire', (connection) => appLogger.info('MySql pool:on acquire'));
    pool.on('release', (connection) => appLogger.info('MySql pool:on release'));
    pool.on('enqueue', () => appLogger.info('MySql pool:on enqueue'));

    const gracefulShutdown = async () => {
        appLogger.info('Closing MySql pool...');
        await pool.end();
        appLogger.info('MySql pool closed');
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

};

// // Create a connection
// const connection = mysql.createConnection({
//     host: 'localhost', // Replace with your MySQL server host
//     user: 'root',      // Replace with your MySQL username
//     password: 'password', // Replace with your MySQL password
//     database: 'testdb',    // Replace with your database name
// });
//
// // Connect to the database
// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err.stack);
//         return;
//     }
//     console.log('Connected to MySQL as id', connection.threadId);
// });
//
// // Execute a simple query
// connection.query('SELECT 1 + 1 AS solution', (err, results) => {
//     if (err) {
//         console.error('Error executing query:', err.stack);
//         return;
//     }
//     console.log('Query result:', results[0].solution);
// });
//
// // Close the connection
// connection.end();
