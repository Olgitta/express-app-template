'use strict';

const express = require('express');
const router = express.Router();
const {getTodosController} = require('./Controller');
const ResponseBuilder = require('../../../core/response-builder/ResponseBuilder');
const {getTransactionId} = require('../../../core/execution-context/executionContextUtil');

let controller = null;
(async () => {
    controller = await getTodosController();
})();

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

function resultHandler(res, result) {
    const {error, status, data} = result;
    const rsBuilder = new ResponseBuilder()
        .setTransactionId(getTransactionId())
        .setMessage(error ? 'FAILED' : 'OK')
        .setError(error)
        .setData(data);

    res.status(status).json(rsBuilder.build());
}

module.exports = router;
