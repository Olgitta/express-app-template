'use strict';

const redis = require('redis');
const appLogger = require('../../logger/appLogger');
const configSchema = require('./configSchema');

let client = null;

module.exports.setup = async (config) => {

    const { error, value } = configSchema.validate(config || {});

    if (error) {
        throw new Error('Redis configuration validation error');
    }

    client = redis.createClient({
        url: config.url,
        socket: {
            reconnectStrategy: (retries) => {
                // if (retries >= config.reconnectStrategy.maxRetries) {
                //     appLogger.info(`Redis Max retries reached: ${config.reconnectStrategy.maxRetries}`);
                //     throw new Error('Redis Max retries reached');
                // }
                /*
                This ensures that the delay never exceeds 3000ms (or 3 seconds),
                no matter how many retry attempts have been made.
                So the first few retries will have delays of 100ms, 200ms, 300ms, etc.,
                but the delay will be capped at 3 seconds after a certain number of retries.
                 */
                return Math.min(retries * 100, 5000);
            },
        },
    });

    client.on('error', (err) => {
        appLogger.error(`Redis Error: ${err.message}`, err);
    });

    client.on('reconnecting', () => {
        appLogger.info('Redis client attempting to reconnect...');
    });

    await client.connect();

    appLogger.info('Redis connection established', value);

    const gracefulShutdown = async () => {
        appLogger.info('Closing Redis connection...');
        await client.quit();
        appLogger.info('Redis connection closed');
    };

    process.on('SIGINT', gracefulShutdown);

}

module.exports.getRedisClient = () => {
    if(client == null) {
        throw new Error('RedisClient not initialized.');
    }

    return {
        ping: async () => {
            return Promise.race([
                client.ping(),
                new Promise((resolve, reject) => {
                    setTimeout(() => reject(new Error("Ping timed out")), 5000);
                }),
            ]);
            // return await client.ping();
        }
    }

}