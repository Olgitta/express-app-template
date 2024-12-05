'use strict';

const appLogger = require('../logger/appLogger');
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
        const sigint = process.listeners('SIGINT').map(listener => {
            return listener.name;
        });

        const sigterm = process.listeners('SIGTERM').map(listener => {
            return listener.name;
        });

        const processListeners = {sigterm, sigint};

        const clients = {};

        try {
            const mySqlClient = getMySqlClient();
            await mySqlClient.ping();
            clients.mysql = 'OK';
        } catch (e) {
            appLogger.error(`HealthCheckController error: ${e.message}`, e);
            clients.mysql = 'ERROR';
        }

        try {
            const redisClient = getRedisClient();
            await redisClient.ping();
            clients.redis = 'OK';
        } catch (e) {
            appLogger.error(`HealthCheckController error: ${e.message}`, e);
            clients.redis = 'ERROR';
        }

        try {
            const mongoClient = getMongoClient();
            // await mongoClient.ping();
            // todo:
            // return {
            //     ping: async () => {
            //         return await client.db("devel").command({ping: 1});
            //     },
            // }
            clients.mongodb = 'OK';
        } catch (e) {
            appLogger.error(`HealthCheckController error: ${e.message}`, e);
            clients.mongodb = 'ERROR';
        }

        return {processListeners, clients};
    }

}