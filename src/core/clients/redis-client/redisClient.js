module.exports = async function getRedisClient(config) {

    const redis = require('redis');
    const appLogger = require('../../logger/appLogger');
    const Joi = require('joi');
    const RedisClientError = require("./RedisClientError");
    const configSchema = Joi.object({
        url: Joi.string().required(),
        reconnectStrategy: Joi.object().keys({
            maxRetries: Joi.number().required(),
        })
    });

    const { error, value } = configSchema.validate(config || {});

    if (error) {
        throw new Error('Redis configuration validation error');
    }

    const client = redis.createClient({
        url: config.url,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries >= config.reconnectStrategy.maxRetries) {
                    appLogger.info(`Max retries reached: ${config.reconnectStrategy.maxRetries}`);
                    throw new RedisClientError('Max retries reached', 'MAXRETRYREACHED');
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

    appLogger.info('Redis connection opened');

    const gracefulShutdown = async () => {
        appLogger.info('Closing Redis connection...');
        await client.quit();
        appLogger.info('Redis connection closed');
    };

    process.on('SIGINT', gracefulShutdown);  // Handle Ctrl+C
    process.on('SIGTERM', gracefulShutdown); // Handle process termination

    // process.on('uncaughtException', async (err) => {
    //     console.error('Uncaught exception:', err);
    //     await client.disconnect();
    //     console.log('Redis connection closed');
    // });

    return client;
}

//
// By default, Node.js allows up to 10 listeners per event. Adding more will trigger a warning:
//     makefile
// Copy code
//
// (node:12345) MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
//     To increase the limit, use:
// javascript
// Copy code
//
// process.setMaxListeners(15); // Example: Increase to 15 listeners
