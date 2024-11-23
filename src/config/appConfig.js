const generalConfig = require('../core/config/generalConfig');

require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`,
});

const envConfig = {
    redis: {
        url: process.env.REDIS_URL,
        reconnectStrategy: {
            maxRetries: Number(process.env.REDIS_RECONNECT_STRATEGY_MAXRETRIES),
        }
    }
};

module.exports = Object.assign(generalConfig, envConfig);