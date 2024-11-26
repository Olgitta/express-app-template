require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`,
});

const {toBoolean} = require('../core/utils/converters');

const appConfig = {

    port: Number(process.env.PORT),

    redisIsOn: toBoolean(process.env.REDIS_ON),
    redis: {
        url: process.env.REDIS_URL,
        reconnectStrategy: {
            maxRetries: Number(process.env.REDIS_RECONNECT_STRATEGY_MAXRETRIES),
        }
    },

    mongoIsOn: toBoolean(process.env.MONGODB_ON),
    mongo: {
        url: process.env.MONGODB_URL,
    },
};

module.exports = appConfig;