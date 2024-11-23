require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`,
});

const appConfig = {
    port: Number(process.env.PORT),
    redisIsOn: Boolean(process.env.REDIS_ON),
    redis: {
        url: process.env.REDIS_URL,
        reconnectStrategy: {
            maxRetries: Number(process.env.REDIS_RECONNECT_STRATEGY_MAXRETRIES),
        }
    }
};

module.exports = appConfig;