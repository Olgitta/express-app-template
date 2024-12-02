'use strict';

const { getAll, create } = require('../../../../src/domains/todos/v1/todosController');
const { getMongoDbRepository } = require('../../../../src/core/clients/mongodb-client/mongodbRepositoryFactory');
const appLogger = require('../../../../src/core/logger/appLogger');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const Todo = require('../../../../src/domains/todos/v1/TodoModel');
const { isValid } = require('../../../../src/domains/todos/v1/todoSchema');

jest.mock('../../../../src/core/clients/mongodb-client/mongodbRepositoryFactory');
jest.mock('../../../../src/core/logger/appLogger');
// jest.mock('../../../../src/domains/todos/v1/todoSchema');
// jest.mock('../../../../src/domains/todos/v1/TodoModel');

describe('Module todosController Tests', () => {
    let mockRepository;

    beforeEach(() => {
        mockRepository = {
            getAll: jest.fn(),
            insert: jest.fn(),
            insertWithTimestamps: jest.fn(),
        };
        getMongoDbRepository.mockResolvedValue(mockRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return all todos with status OK', async () => {
            const mockData = [{ id: 1, title: 'Test Todo', completed: false }];
            mockRepository.getAll.mockResolvedValue(mockData);

            const response = await getAll();

            // expect(getMongoDbRepository).toHaveBeenCalledWith('devel', 'todos');
            // expect(mockRepository.getAll).toHaveBeenCalled();
            expect(response).toEqual({
                error: null,
                status: StatusCodes.OK,
                data: mockData,
            });
        });

        it('should handle repository errors gracefully', async () => {
            const errorMessage = 'Database error';
            mockRepository.getAll.mockRejectedValue(new Error(errorMessage));

            const response = await getAll();

            expect(appLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Todos error: Database error'),
                expect.any(Error)
            );
            expect(response).toEqual({
                error: errorMessage,
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                data: null,
            });
        });
    });

    describe('create', () => {
        it('should create a new todo and return status CREATED', async () => {
            const mockRequestBody = { title: 'New Todo', completed: false };
            const mockCreatedTodo = { id: 1, ...mockRequestBody };
            mockRepository.insertWithTimestamps.mockResolvedValue(mockCreatedTodo);
            // isValid.mockReturnValue(true);

            const response = await create(mockRequestBody);

            // expect(getMongoDbRepository).toHaveBeenCalledWith('devel', 'todos');
            // expect(isValid).toHaveBeenCalledWith(expect.any(Todo));
            // expect(mockRepository.insert).toHaveBeenCalledWith(expect.any(Todo));
            expect(response).toEqual({
                error: null,
                status: StatusCodes.CREATED,
                data: mockCreatedTodo,
            });
        });

        it('should return BAD_REQUEST for invalid todo data', async () => {
            const mockRequestBody = { title: '', completed: false };
            // isValid.mockReturnValue(false);

            const response = await create(mockRequestBody);

            // expect(isValid).toHaveBeenCalledWith(expect.any(Todo));
            expect(response).toEqual({
                error: new Error(ReasonPhrases.BAD_REQUEST),
                status: StatusCodes.BAD_REQUEST,
                data: null,
            });
        });

        it('should handle repository errors gracefully during creation', async () => {
            const mockRequestBody = { title: 'New Todo', completed: false };
            const errorMessage = 'Insert failed';
            mockRepository.insertWithTimestamps.mockRejectedValue(new Error(errorMessage));
            // isValid.mockReturnValue(true);

            const response = await create(mockRequestBody);

            expect(appLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Todos error: Insert failed'),
                expect.any(Error)
            );
            expect(response).toEqual({
                error: errorMessage,
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                data: null,
            });
        });
    });
});
