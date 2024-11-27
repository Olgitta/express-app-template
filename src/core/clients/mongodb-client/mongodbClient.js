const appLogger = require("../../logger/appLogger");
module.exports = async function getMongoClient(config) {

    const { MongoClient } = require('mongodb');
    const appLogger = require('../../logger/appLogger');
    const MongoClientError = require("./MongoClientError");
    const configSchema = require('./configSchema');

    const { error, value } = configSchema.validate(config || {});

    if (error) {
        throw new Error('MongoDb configuration validation error');
    }

    const client = new MongoClient(config.url, {
        monitorCommands: true,
        maxPoolSize: 10, // Maximum connections
        socketTimeoutMS: 30000, // 30 seconds timeout
        serverSelectionTimeoutMS: 5000, // Wait up to 5 seconds for a server
    });

    client.on('error', (e) => appLogger.error('MongoDb Server closed'));
    client.on('serverClosed', () => appLogger.info('MongoDb Server closed'));
    client.on('serverDescriptionChanged', event => appLogger.info('MongoDb Server changed:', event));
    client.on('serverHeartbeatFailed', error => appLogger.error('MongoDb Heartbeat failed:', error));

    await client.connect();
    appLogger.info('Connected successfully to MongoDB', value);

    // const db = client.db('test');
    // const collection = db.collection('example');
    // const docs = await collection.find().toArray();
    // console.log('Documents:', docs);

    const gracefulShutdown = async () => {
        appLogger.info('Closing Mongo connection...');
        await client.close();
        appLogger.info('Mongo connection closed');
    };

    process.on('SIGINT', gracefulShutdown);  // Handle Ctrl+C
    process.on('SIGTERM', gracefulShutdown); // Handle process termination

    return client;
}