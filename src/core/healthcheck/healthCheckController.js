'use strict';

const appLogger = require("../logger/appLogger");
const ResponseBuilder = require("../response-builder/ResponseBuilder");
const {getTransactionId} = require("../execution-context/executionContextUtil");

let instance;

module.exports = function getHealthCheckController() {
    if (!instance) {
        instance = new HealthCheckController();
    }
    return instance;
};

class HealthCheckController {

    healthCheck() {
        let sigint = process.listeners('SIGINT').map(listener => {
            return listener.name;
        });

        let sigterm = process.listeners('SIGTERM').map(listener => {
            return listener.name;
        });

        let processListeners = {sigterm, sigint};

        appLogger.info('healthCheckController result', {processListeners});

        return new ResponseBuilder()
            .setData({processListeners})
            .setMessage('OK')
            .setTransactionId(getTransactionId())
            .build();
    }

}