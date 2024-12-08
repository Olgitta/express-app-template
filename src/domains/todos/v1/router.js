'use strict';

const express = require('express');
const router = express.Router();
const {getTodosController} = require('./Controller');
const ResponseBuilder = require('../../../core/response-builder/ResponseBuilder');
const {getTransactionId} = require('../../../core/execution-context/executionContextUtil');

const requestHandler = (handler) => {
    return async (req, res) => {
        const controller = await getTodosController();
        await handler(controller, req, res);
    };
};

const resultHandler = (res, {error, status, data}) => {
    const rsBuilder = new ResponseBuilder()
        .setTransactionId(getTransactionId())
        .setMessage(error ? 'FAILED' : 'OK')
        .setError(error)
        .setData(data);

    res.status(status).json(rsBuilder.build());
};

router.get('/', requestHandler(async (controller, req, res) => {
    const result = await controller.getAll();
    resultHandler(res, result);
}));

router.get('/:id', requestHandler(async (controller, req, res) => {
    const result = await controller.getById(req);
    resultHandler(res, result);
}));

router.put('/:id', requestHandler(async (controller, req, res) => {
    const result = await controller.update(req);
    resultHandler(res, result);
}));

router.delete('/:id', requestHandler(async (controller, req, res) => {
    const result = await controller.deleteById(req);
    resultHandler(res, result);
}));

router.post('/', requestHandler(async (controller, req, res) => {
    const result = await controller.create(req);
    resultHandler(res, result);
}));

module.exports = router;
