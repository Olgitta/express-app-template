'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./todosController');
const ResponseBuilder = require('../../../core/response-builder/ResponseBuilder');
const appLogger = require('../../../core/logger/appLogger');
const {getTransactionId} = require('../../../core/execution-context/executionContextUtil');

/**
 * Example data store for demonstration. Replace with your database logic.
 */
let todos = [
    {id: 1, title: 'Learn Node.js', completed: false},
    {id: 2, title: 'Write Express routes', completed: true},
];

router.get('/', async (req, res) => {

    handleResult(req, res, await controller.getAll());

});

/**
 * GET /todos/:id - Retrieve a specific todo by ID
 */
router.get('/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) {
        return res.status(404).json({message: 'Todo not found'});
    }
    res.json(todo);
});


router.post('/', async (req, res) => {

    handleResult(req, res, await controller.create(req.body));

});

/**
 * PUT /todos/:id - Update an existing todo
 */
router.put('/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) {
        return res.status(404).json({message: 'Todo not found'});
    }

    const {title, completed} = req.body;

    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;

    res.json(todo);
});

/**
 * DELETE /todos/:id - Delete a todo by ID
 */
router.delete('/:id', (req, res) => {
    const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
    if (todoIndex === -1) {
        return res.status(404).json({message: 'Todo not found'});
    }

    const deletedTodo = todos.splice(todoIndex, 1);
    res.json(deletedTodo);
});

function handleResult(req, res, result) {
    const {error, status, data} = result;
    const rsBuilder = new ResponseBuilder()
        .setTransactionId(getTransactionId())
        .setMessage(error ? 'FAILED' : 'OK');

    if(data) {
        rsBuilder.setData(data)
    }

    res.status(status).json(rsBuilder.build());
}

module.exports = router;
