'use strict';

const redis = require('redis');
const appLogger = require('../../logger/appLogger');
const configSchema = require('./configSchema');

let client = null;

module.exports.getRedisClient = () => {
    if(client === null) {
        throw new Error('RedisClient not initialized.');
    }

    return {
        ping: async () => {
            return await client.ping();
        }
    }

};

module.exports.setup = async (config) => {

    const { error, value } = configSchema.validate(config || {});

    if (error) {
        throw new Error('Redis configuration validation error');
    }

    client = redis.createClient({
        url: config.url,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries >= config.reconnectStrategy.maxRetries) {
                    appLogger.error(`Redis Max retries reached: ${config.reconnectStrategy.maxRetries}`);
                    return false;
                }
                /*
                This ensures that the delay never exceeds 3000ms (or 3 seconds),
                no matter how many retry attempts have been made.
                So the first few retries will have delays of 100ms, 200ms, 300ms, etc.,
                but the delay will be capped at 3 seconds after a certain number of retries.
                 */
                return Math.min(retries * 100, 3000);
            },
        },
    });

    // client.on('connect', () => {
    //     appLogger.info(`Redis Client connection started: ${client.isOpen}`);
    // });
    //
    // client.on('ready', () => {
    //     appLogger.info(`Redis Client connection ready: ${client.isReady}`);
    // });

    client.on('error', (err) => {

        // appLogger.info(`onerror: Redis Client isOpen: ${client.isOpen}`);
        // appLogger.info(`onerror: Redis Client isReady: ${client.isReady}`);

        if(err.message) {
            appLogger.error(`Redis Error: ${err.message}`, err);
        } else if (err.errors && Array.isArray(err.errors)) {
            for(const e of err.errors) {
                appLogger.error(`Redis Error: ${e.message}`, e);
            }
        } else {
            appLogger.error('Redis Error', err);
        }
    });

    // client.on('reconnecting', () => {
    //     appLogger.info('Redis client attempting to reconnect...');
    // });

    await client.connect();

    appLogger.info('Redis connection established', value);

    const gracefulShutdown = async () => {
        appLogger.info('Closing Redis connection...');
        await client.quit();
        appLogger.info('Redis connection closed');
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

};