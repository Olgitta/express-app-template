'use strict';

const appLogger = require('../logger/appLogger');
const {mySqlClientHealthcheck} = require('../clients/mysql-client/mysqlClient');
const {redisClientHealthcheck} = require('../clients/redis-client/redisClient');
const {mongoClientHealthcheck} = require('../clients/mongodb-client/mongodbClient');

module.exports = function getHealthCheckController(config) {

    return {
        async healthCheck() {
            appLogger.info('healthCheck started.');

            const summary = {
                clients: []
            };

            const clientsToCheck = [];
            if (config.redisIsOn) {
                clientsToCheck.push(redisClientHealthcheck());
            }
            if (config.mongoIsOn) {
                clientsToCheck.push(mongoClientHealthcheck());
            }
            if (config.mysqlIsOn) {
                clientsToCheck.push(mySqlClientHealthcheck());
            }

            if(clientsToCheck.length > 0) {
                const results = await Promise.allSettled(clientsToCheck);
                for (const result of results) {
                    appLogger.info(`healthCheck in progress: ${result.value}`);
                    summary.clients.push(result.value);
                }
            }

            appLogger.info('healthCheck finished.', {summary});

            return summary;
        }
    }
};