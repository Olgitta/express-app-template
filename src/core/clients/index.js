'use strict';

module.exports = async function setupClients(appConfig) {

    if(appConfig.redisIsOn) {
        await require('./redis-client/redisClient').setup(appConfig.redis);
    }

    if(appConfig.mongoIsOn) {
        await require('./mongodb-client/mongodbClient').setup(appConfig.mongo);
    }

    if(appConfig.mysqlIsOn) {
        await require('./mysql-client/mysqlClient').setup(appConfig.mysql);
    }
}