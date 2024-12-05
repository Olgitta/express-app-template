'use strict';

const express = require('express');
const {getTodosController} = require('./Controller');
const ResponseBuilder = require('../../../core/response-builder/ResponseBuilder');
const {getTransactionId} = require('../../../core/execution-context/executionContextUtil');

let initializedRouter = null;

module.exports = async function initializeRouter() {

    if (initializedRouter) {
        return initializedRouter;
    }

    const controller = await getTodosController();
    const router = express.Router();

    router.get('/', async (req, res) => {
        resultHandler(res, await controller.getAll());
    });
    router.get('/:id', async (req, res) => {
        resultHandler(res, await controller.getById(req));
    });
    router.post('/', async (req, res) => {
        resultHandler(res, await controller.create(req));
    });
    router.put('/:id', async (req, res) => {
        resultHandler(res, await controller.update(req));
    });
    router.delete('/:id', async (req, res) => {
        resultHandler(res, await controller.deleteById(req));
    });

    initializedRouter = router;
    return initializedRouter;
};

function resultHandler(res, result) {
    const {error, status, data} = result;
    const rsBuilder = new ResponseBuilder()
        .setTransactionId(getTransactionId())
        .setMessage(error ? 'FAILED' : 'OK')
        .setError(error)
        .setData(data);

    res.status(status).json(rsBuilder.build());
}
