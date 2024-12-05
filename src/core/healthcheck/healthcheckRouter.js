const express = require('express');
const {StatusCodes} = require('http-status-codes');
const ResponseBuilder = require('../response-builder/ResponseBuilder');
const {getTransactionId} = require('../execution-context/executionContextUtil');

module.exports = function(appConfig) {
    const healthcheckRouter = express.Router();
    const healthCheckController = require('./healthCheckController')(appConfig);

    healthcheckRouter.get('/healthcheck', async function(req, res, next) {

        try{
            res.json(new ResponseBuilder()
                .setData(await healthCheckController.healthCheck())
                .setMessage('OK')
                .setTransactionId(getTransactionId())
                .build());
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ResponseBuilder()
                .setMessage('FAILED')
                .setTransactionId(getTransactionId())
                .build());
        }
    });
    return healthcheckRouter;
};