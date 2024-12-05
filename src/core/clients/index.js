'use strict';

module.exports = async function setupClients(appConfig) {
    const setupTasks = [];

    if (appConfig.redisIsOn) {
        const redisSetup = require('./redis-client/redisClient').setup(appConfig.redis);
        setupTasks.push(redisSetup);
    }

    if (appConfig.mongoIsOn) {
        const mongoSetup = require('./mongodb-client/mongodbClient').setup(appConfig.mongodb);
        setupTasks.push(mongoSetup);
    }

    if (appConfig.mysqlIsOn) {
        const mysqlSetup = require('./mysql-client/mysqlClient').setup(appConfig.mysql);
        setupTasks.push(mysqlSetup);
    }

    await Promise.all(setupTasks);
};
