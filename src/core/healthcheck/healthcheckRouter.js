const express = require('express');
const ResponseBuilder = require('../response-builder/ResponseBuilder');
const {getTransactionId} = require('../execution-context/executionContextUtil');
const healthcheckRouter = express.Router();
const healthCheckController = require('./healthCheckController')();

healthcheckRouter.get('/healthcheck', async function(req, res, next) {

    try{
        res.json(new ResponseBuilder()
            .setData(await healthCheckController.healthCheck())
            .setMessage('OK')
            .setTransactionId(getTransactionId())
            .build());
    } catch (error) {
        res.status(500).json(new ResponseBuilder()
            .setMessage('FAILED')
            .setTransactionId(getTransactionId())
            .build());
    }
});

module.exports = healthcheckRouter;