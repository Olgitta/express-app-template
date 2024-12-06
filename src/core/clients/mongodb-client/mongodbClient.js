'use strict';

const {MongoClient} = require('mongodb');
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
    try {
        await client.db(config.database).command({ping: 1});
        return 'mongoClient OK';
    } catch (e) {
        appLogger.error(`mongoClientHealthcheck error: ${e.message}`, e);
        return 'mongoClient ERROR';
    }
};

module.exports.setup = async (cfg) => {

    config = cfg;
    const {error, value} = configSchema.validate(config || {});

    if (error) {
        throw new Error('MongoDb configuration validation error');
    }

    const connectionString = `${config.url}/${config.database}`;

    client = new MongoClient(connectionString, {
        monitorCommands: true,
        maxPoolSize: 10, // Maximum connections
        socketTimeoutMS: 30000, // 30 seconds timeout
        serverSelectionTimeoutMS: 5000, // Wait up to 5 seconds for a server
    });

    client.on('error', (e) => {
        appLogger.error('Mongo Client error', e)
    });
    // client.on('serverClosed', () => appLogger.info('MongoDb Server closed'));
    // client.on('serverDescriptionChanged', event => appLogger.info('MongoDb Server changed:', event));
    // client.on('serverHeartbeatFailed', error => appLogger.error('MongoDb Heartbeat failed:', error));

    await client.connect();
    appLogger.info('Mongo connection established', value);

    // const db = client.db('test');
    // const collection = db.collection('example');
    // const docs = await collection.find().toArray();
    // console.log('Documents:', docs);

    const gracefulShutdown = async () => {
        appLogger.info('Closing Mongo connection...');
        await client.close();
        appLogger.info('Mongo connection closed');
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

}
