'use strict';

const {getTodosController} = require('../../../../src/domains/todos/v1/Controller');
const {getMongoDbRepository} = require('../../../../src/core/clients/mongodb-client/mongodbRepositoryFactory');
const appLogger = require('../../../../src/core/logger/appLogger');
const {getAppConfig} = require('../../../../src/config/appConfig');
const {StatusCodes} = require('http-status-codes');
const consts = require('../../../../src/domains/todos/v1/consts');

jest.mock('../../../../src/core/clients/mongodb-client/mongodbRepositoryFactory');
jest.mock('../../../../src/core/logger/appLogger');
jest.mock('../../../../src/config/appConfig');
jest.mock('../../../../src/domains/todos/v1/consts', () => ({
    TODOS_COLLECTION_NAME: 'mock_todos',
    USERS_COLLECTION_NAME: 'mock_users',
}));

describe('Todo Controller Test', () => {
    let mockRepository;
    let mockConfig;
    let controller;

    beforeEach(async () => {

        mockRepository = {
            getAll: jest.fn(),
            insertWithTimestamps: jest.fn(),
            updateWithTimestamps: jest.fn(),
            getById: jest.fn(),
            remove: jest.fn(),
        };

        mockConfig = {
            todos: {
                mongodb: {
                    name: 'testdb',
                    whitelistedCollections: ['mock_todos', 'mock_users'],
                }
            }
        }

        getMongoDbRepository.mockResolvedValue(mockRepository);
        getAppConfig.mockReturnValue(mockConfig);

        controller = await getTodosController();

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {

        it('should return all todos with status 200', async () => {
            const mockData = [{id: '1', title: 'Test Todo', completed: false}];
            mockRepository.getAll.mockResolvedValue(mockData);

            const response = await controller.getAll();

            expect(response).toEqual({
                error: null,
                status: StatusCodes.OK,
                data: mockData,
            });
            // expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
        });

        it('should handle errors and return status 500', async () => {

            const mockError = new Error('Database error');
            mockRepository.getAll.mockRejectedValue(mockError);

            const response = await controller.getAll();

            // expect(response.error).toBeInstanceOf(Error);

            expect(response).toEqual({
                error: expect.any(Error),
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                data: null,
            });
            // expect(appLogger.error).toHaveBeenCalledWith(expect.any(String), mockError);
        });
    });

    describe('create', () => {
        it('should create a new todo and return status 201', async () => {
            const request = {
                body: {title: 'New Todo', completed: false}
            };
            const mockInsertedId = '12345';

            mockRepository.insertWithTimestamps.mockResolvedValue({insertedId: mockInsertedId});

            const response = await controller.create(request);

            expect(response).toEqual({
                error: null,
                status: StatusCodes.CREATED,
                data: {id: mockInsertedId},
            });
            // expect(mockRepository.insertWithTimestamps).toHaveBeenCalledWith(expect.any(Object));
        });

        it('should return status 400 for invalid data', async () => {
            const request = {
                body: {title: '', completed: false}
            };

            const response = await controller.create(request);

            expect(response).toEqual({
                error: expect.any(Error),
                status: StatusCodes.BAD_REQUEST,
                data: null,
            });
            // expect(appLogger.error).toHaveBeenCalledWith(expect.any(String), expect.any(Error));
        });
    });

    describe('update', () => {
        it('should update an existing todo and return status 200', async () => {
            const request = {
                body: {title: 'Updated Todo', completed: true},
                params: {id: '123456'},
            };
            mockRepository.updateWithTimestamps.mockResolvedValue({matchedCount: 1});

            const response = await controller.update(request);

            expect(response).toEqual({
                error: null,
                status: StatusCodes.OK,
                data: {id: request.params.id},
            });
        });

        it('should return status 500 if update fails', async () => {
            const request = {
                body: {title: 'Updated Todo', completed: true},
                params: {id: '123456'},
            };
            mockRepository.updateWithTimestamps.mockResolvedValue({matchedCount: 0});

            const response = await controller.update(request);

            expect(response).toEqual({
                error: expect.any(Error),
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                data: null,
            });
            // expect(appLogger.error).toHaveBeenCalledWith(expect.any(String), expect.any(Error));
        });
    });

    describe('getById', () => {
        it('should return a todo by ID with status 200', async () => {
            const request = {
                params: {id: '123456'},
            };
            const mockData = {id: request.params.id, title: 'Test Todo', completed: false};
            mockRepository.getById.mockResolvedValue(mockData);

            const response = await controller.getById(request);

            expect(response).toEqual({
                error: null,
                status: StatusCodes.OK,
                data: mockData,
            });
        });

        it('should return status 204 if todo not found', async () => {
            const request = {
                params: {id: '123456'},
            };
            mockRepository.getById.mockResolvedValue(null);

            const response = await controller.getById(request);

            expect(response).toEqual({
                error: null,
                status: StatusCodes.NO_CONTENT,
                data: null,
            });
        });
    });

    describe('deleteById', () => {
        it('should delete a todo and return status 200', async () => {
            const request = {
                params: {id: '123456'},
            };
            mockRepository.remove.mockResolvedValue({deletedCount: 1});

            const response = await controller.deleteById(request);

            expect(response).toEqual({
                error: null,
                status: StatusCodes.OK,
                data: null,
            });
        });

        it('should return status 204 if nothing is deleted', async () => {
            const request = {
                params: {id: '123456'},
            };
            mockRepository.remove.mockResolvedValue({deletedCount: 0});

            const response = await controller.deleteById(request);

            expect(response).toEqual({
                error: null,
                status: StatusCodes.NO_CONTENT,
                data: null,
            });
        });
    });
});
