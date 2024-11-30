'use strict';

const redis = require('redis');
const appLogger = require('../../logger/appLogger');
const configSchema = require('./configSchema');
const AppError = require("../../errors/AppError");

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
                if (retries >= config.reconnectStrategy.maxRetries) {
                    appLogger.info(`Max retries reached: ${config.reconnectStrategy.maxRetries}`);
                    throw new AppError('Max retries reached', 'MAXRETRYREACHED');
                }

                const jitter = Math.floor(Math.random() * 200);
                const delay = Math.min(Math.pow(2, retries) * 50, 2000);

                return delay + jitter;
            },
        },
    });

    client.on('error', (err) => {
        appLogger.error(`Redis Error: ${err.message}`, err);
        if(err?.code === 'MAXRETRYREACHED') {
            throw err;
        }
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