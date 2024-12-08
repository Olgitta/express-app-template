'use strict';

const { MongoClient } = require('mongodb');
const appLogger = require('../../logger/appLogger');
const configSchema = require('./configSchema');

let client = null;
let config = null;

module.exports.getMongoClient = () => {
    if (client === null) {
        throw new Error('MongoDbClient not initialized.');
    }
    return client;
};

module.exports.mongoClientHealthcheck = async () => {
    if (!client) {
        return 'mongoClient NOT INITIALIZED';
    }

    try {
        await client.db(config.database).command({ ping: 1 });
        return 'mongoClient OK';
    } catch (e) {
        appLogger.error(`mongoClientHealthcheck error: ${e.message}`, { error: e });
        return 'mongoClient ERROR';
    }
};

module.exports.setup = async (cfg) => {
    const { error, value } = configSchema.validate(cfg || {});
    if (error) {
        throw new Error(`MongoDb configuration validation error: ${error.message}`);
    }

    config = value;

    const connectionString = config.url; // Use full URL with MongoDB options
    const options = {
        monitorCommands: true,
        maxPoolSize: config.maxPoolSize || 10,
        socketTimeoutMS: config.socketTimeoutMS || 30000,
        serverSelectionTimeoutMS: config.serverSelectionTimeoutMS || 5000,
    };

    client = new MongoClient(connectionString, options);

    // Register MongoDB client events for diagnostics
    client.on('error', (e) => appLogger.error('Mongo Client error', { error: e }));
    client.on('serverClosed', () => appLogger.debug('MongoDB Server closed'));
    client.on('serverDescriptionChanged', (event) =>
        appLogger.info('MongoDB Server description changed', { event })
    );
    client.on('serverHeartbeatFailed', (error) =>
        appLogger.error('MongoDB Heartbeat failed', { error })
    );

    try {
        await client.connect();
        appLogger.info('Mongo connection established successfully.');
    } catch (err) {
        appLogger.error('Failed to connect to MongoDB', { error: err });
        throw new Error(`Failed to connect to MongoDB: ${err.message}`);
    }

    const gracefulShutdown = async () => {
        if (client) {
            try {
                appLogger.info('Closing Mongo connection...');
                await client.close();
                appLogger.info('Mongo connection closed.');
            } catch (err) {
                appLogger.error('Error during Mongo shutdown', { error: err });
            }
        }
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
};
