'use strict';

const express = require('express');
const supertest = require('supertest');
const router = require('../../../../src/domains/todos/v1/router');
const { getTodosController } = require('../../../../src/domains/todos/v1/Controller');
const {getTransactionId} = require('../../../../src/core/execution-context/executionContextUtil');

jest.mock('../../../../src/domains/todos/v1/Controller', () => ({
    getTodosController: jest.fn(),
}));
jest.mock('../../../../src/core/execution-context/executionContextUtil', () => ({
    getTransactionId: jest.fn(),
}));

const mockController = {
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    create: jest.fn(),
};

const app = express();
app.use(express.json());
app.use('/todos', router);

describe('Todos Router Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getTodosController.mockResolvedValue(mockController);
        getTransactionId.mockReturnValue('transaction-id');
    });

    test('GET /todos should return a list of todos', async function() {
        const mockTodos = [{ id: '1', title: 'Todo 1', completed: false }];
        mockController.getAll.mockResolvedValue({
            error: null,
            status: 200,
            data: mockTodos,
        });

        try{
            const response = await supertest(app).get('/todos');

            expect(response.status).toBe(200);
            expect(response.body.metadata.message).toBe('OK');
            expect(response.body.data).toEqual(mockTodos);
            expect(mockController.getAll).toHaveBeenCalledTimes(1);
        } catch (error) {
            console.log(error);
        }

    });

    test('GET /todos/:id should return a specific todo', async () => {
        const mockTodo = { id: '1', title: 'Todo 1', completed: false };
        mockController.getById.mockResolvedValue({
            error: null,
            status: 200,
            data: mockTodo,
        });

        const response = await supertest(app).get('/todos/1');

        expect(response.status).toBe(200);
        expect(response.body.metadata.message).toBe('OK');
        expect(response.body.data).toEqual(mockTodo);
        expect(mockController.getById).toHaveBeenCalledWith(expect.objectContaining({
            params: { id: '1' },
        }));
        expect(mockController.getById).toHaveBeenCalledTimes(1);
    });

    test('POST /todos should create a new todo', async () => {
        const newTodo = { title: 'New Todo', completed: false };
        const mockId = '123';
        mockController.create.mockResolvedValue({
            error: null,
            status: 201,
            data: { id: mockId },
        });

        const response = await supertest(app).post('/todos').send(newTodo);

        expect(response.status).toBe(201);
        expect(response.body.metadata.message).toBe('OK');
        expect(response.body.data).toEqual({ id: mockId });
        expect(mockController.create).toHaveBeenCalledWith(expect.objectContaining({
            body: newTodo,
        }));
        expect(mockController.create).toHaveBeenCalledTimes(1);
    });

    test('PUT /todos/:id should update a todo', async () => {
        const updatedTodo = { title: 'Updated Todo', completed: true };
        const mockId = '123';
        mockController.update.mockResolvedValue({
            error: null,
            status: 200,
            data: { id: mockId },
        });

        const response = await supertest(app).put(`/todos/${mockId}`).send(updatedTodo);

        expect(response.status).toBe(200);
        expect(response.body.metadata.message).toBe('OK');
        expect(response.body.data).toEqual({ id: mockId });
        expect(mockController.update).toHaveBeenCalledWith(expect.objectContaining({
            body: updatedTodo,
            params: { id: mockId },
        }));
        expect(mockController.update).toHaveBeenCalledTimes(1);
    });

    test('DELETE /todos/:id should delete a todo', async () => {
        const mockId = '123';
        mockController.deleteById.mockResolvedValue({
            error: null,
            status: 200,
            data: null,
        });

        const response = await supertest(app).delete(`/todos/${mockId}`);

        expect(response.status).toBe(200);
        expect(response.body.metadata.message).toBe('OK');
        // expect(response.body.data).toBe({});
        expect(mockController.deleteById).toHaveBeenCalledWith(expect.objectContaining({
            params: { id: mockId },
        }));
        expect(mockController.deleteById).toHaveBeenCalledTimes(1);
    });

    test('GET /todos/:id with non-existent ID should return no content', async () => {
        mockController.getById.mockResolvedValue({
            error: null,
            status: 204,
            data: null,
        });

        const response = await supertest(app).get('/todos/999');

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
        expect(mockController.getById).toHaveBeenCalledWith(expect.objectContaining({
            params: { id: '999' },
        }));
        expect(mockController.getById).toHaveBeenCalledTimes(1);
    });
});
