'use strict';

const appLogger = require('../logger/appLogger');
const ResponseBuilder = require('../response-builder/ResponseBuilder');
const {getTransactionId} = require('../execution-context/executionContextUtil');
const {getMySqlClient} = require('../clients/mysql-client/mysqlClient');
const {getRedisClient} = require('../clients/redis-client/redisClient');
const {getMongoClient} = require('../clients/mongodb-client/mongodbClient');

let instance;

module.exports = function getHealthCheckController() {
    if (!instance) {
        instance = new HealthCheckController();
    }
    return instance;
};

class HealthCheckController {

    async healthCheck() {
        let sigint = process.listeners('SIGINT').map(listener => {
            return listener.name;
        });

        let sigterm = process.listeners('SIGTERM').map(listener => {
            return listener.name;
        });

        let processListeners = {sigterm, sigint};

        let clients = {};

        try {
            const mySqlClient = getMySqlClient();
            await mySqlClient.ping();
            clients.mysql = 'OK';
        } catch (e) {
            appLogger.error('healthCheckController', e);
            clients.mysql = 'ERROR';
        }

        try {
            const redisClient = getRedisClient();
            await redisClient.ping();
            clients.redis = 'OK';
        } catch (e) {
            appLogger.error('healthCheckController', e);
            clients.redis = 'ERROR';
        }

        try {
            const mongoClient = getMongoClient();
            await mongoClient.ping();
            clients.mongodb = 'OK';
        } catch (e) {
            appLogger.error('healthCheckController', e);
            clients.mongodb = 'ERROR';
        }

        return new ResponseBuilder()
            .setData({processListeners, clients})
            .setMessage('OK')
            .setTransactionId(getTransactionId())
            .build();
    }

}