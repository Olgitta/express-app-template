'use strict';

require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`,
});

const {toBoolean} = require('../core/utils/conversions');
const appLogger = require("../core/logger/appLogger");

let appConfig = null;

const setupAppConfig = () => {
    appConfig = {

        port: Number(process.env.PORT),

        redisIsOn: toBoolean(process.env.REDIS_ON),
        redis: {
            url: process.env.REDIS_URL,
            reconnectStrategy: {
                maxRetries: Number(process.env.REDIS_RECONNECT_STRATEGY_MAXRETRIES),
            }
        },

        mongoIsOn: toBoolean(process.env.MONGODB_ON),
        mongodb: {
            url: process.env.MONGODB_URL,
        },

        mysqlIsOn: toBoolean(process.env.MYSQL_ON),
        mysql: {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        }
    };

    appLogger.info('AppConfig loaded :', appConfig);
};

module.exports.getAppConfig = () => {
    if(!appConfig) {
        setupAppConfig();
    }
    return appConfig;
};