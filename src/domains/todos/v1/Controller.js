'use strict';

const appLogger = require('../../../core/logger/appLogger');
const {getMongoDbRepository} = require('../../../core/clients/mongodb-client/mongodbRepositoryFactory');
const {StatusCodes, ReasonPhrases} = require('http-status-codes');
const TodoBuilder = require('./TodoBuilder');
const {isValidNonEmptyString, isBoolean} = require('../../../core/utils/validators');
const {getAppConfig} = require('../../../config/appConfig');
const {validateConfig} = require("./configSchema");
const consts = require('./consts');
const {TodoError, errorCode} = require("../TodoError");

let controller = null;

class Controller {

    constructor(repository) {
        this.repository = repository;
    }

    async handleOperation(callback) {
        try {
            return await callback();
        } catch (error) {
            const todoError = new TodoError(`Todos Controller Operation Failed: ${error.message}`, errorCode.GENERAL_ERROR);
            appLogger.error(todoError.message, error);
            return {
                error: todoError,
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }
    }

    validate(todo) {
        const {title, completed} = todo;
        if (!isValidNonEmptyString(title)) {
            return false;
        }

        if (!isBoolean(completed)) {
            return false;
        }

        return true;
    }

    /**
     *
     * @returns {Promise<*|{data: null, error: TodoError, status: StatusCodes.INTERNAL_SERVER_ERROR}|undefined>}
     */
    async getAll() {
        return await this.handleOperation(async () => {
            const result = await this.repository.getAll();

            return {
                error: null,
                status: StatusCodes.OK,
                data: result,
            }
        });
    }

    /**
     *
     * @param req
     * @returns {Promise<*|{data: null, error: TodoError, status: StatusCodes.INTERNAL_SERVER_ERROR}|undefined>}
     */
    async getById(req) {
        return await this.handleOperation(async () => {
            const id = req.params?.id;
            const result = await this.repository.getById(id);

            return {
                error: null,
                status: result ? StatusCodes.OK : StatusCodes.NO_CONTENT,
                data: result
            }
        })
    }

    /**
     *
     * @param req
     * @returns {Promise<*|{data: null, error: TodoError, status: StatusCodes.INTERNAL_SERVER_ERROR}|undefined>}
     */
    async create(req) {
        return await this.handleOperation(async () => {

            const {title, completed} = req.body;

            const todo = new TodoBuilder()
                .setTitle(title)
                .setCompleted(completed)
                .buildForCreation();

            if (!this.validate(todo)) {
                const error = new TodoError('Todo validation failed.', errorCode.TODO_VALIDATION_ERROR);
                appLogger.error(error.message, error);
                return {
                    error: error,
                    status: StatusCodes.BAD_REQUEST,
                    data: null
                }
            }

            const result = await this.repository.insertWithTimestamps(todo);
            const id = result.insertedId?.toString();

            if (!isValidNonEmptyString(id)) {
                const error = new TodoError('Create Todo failed.', errorCode.TODO_INSERT_INTO_DB_ERROR);
                appLogger.error(error.message, error);
                return {
                    error: error,
                    status: StatusCodes.INTERNAL_SERVER_ERROR,
                    data: null
                }
            }

            return {
                error: null,
                status: StatusCodes.CREATED,
                data: {id}
            }
        });

    }

    /**
     *
     * @param req
     * @returns {Promise<*|{data: null, error: *, status: StatusCodes.INTERNAL_SERVER_ERROR}|undefined>}
     */
    async update(req) {
        return await this.handleOperation(async () => {
            const {title, completed} = req.body;
            const id = req.params.id;

            const todo = new TodoBuilder();
            todo.setCompleted(completed);
            todo.setTitle(title);
            todo.setId(id);

            if (!this.validate(todo)) {
                const error = new TodoError('Todo validation failed.', errorCode.TODO_VALIDATION_ERROR);
                appLogger.error(error.message, error);
                return {
                    error: error,
                    status: StatusCodes.BAD_REQUEST,
                    data: null
                }
            }

            const result = await this.repository.updateWithTimestamps(id, todo);

            if (result.matchedCount === 1) {
                return {
                    error: null,
                    status: StatusCodes.OK,
                    data: {id}
                }
            } else {
                const error = new TodoError('Update Todo failed.', errorCode.TODO_UPDATE_ON_DB_ERROR);
                appLogger.error(error.message, error);
                return {
                    error: error,
                    status: StatusCodes.INTERNAL_SERVER_ERROR,
                    data: null
                }
            }

        });
    }

    /**
     *
     * @param req
     * @returns {Promise<*|{data: null, error: *, status: StatusCodes.INTERNAL_SERVER_ERROR}|undefined>}
     */
    async deleteById(req) {
        return await this.handleOperation(async () => {
            const id = req.params.id;
            const result = await this.repository.remove(id);

            return {
                error: null,
                status: result.deletedCount ? StatusCodes.OK : StatusCodes.NO_CONTENT,
                data: null
            }
        })
    }

}


module.exports.initializeTodosController = async function () {
    const config = getAppConfig()?.todos;
    validateConfig(config);

    if (!config.mongodb.whitelistedCollections.includes(consts.TODOS_COLLECTION_NAME)) {
        throw new TodoError(`Invalid collection name ${consts.TODOS_COLLECTION_NAME}`);
    }

    const repository = await getMongoDbRepository(config.mongodb.name, consts.TODOS_COLLECTION_NAME);

    controller = new Controller(repository);
    return controller;
};

module.exports.getTodosController = async function () {
    const config = getAppConfig()?.todos;
    validateConfig(config);

    if (!config.mongodb.whitelistedCollections.includes(consts.TODOS_COLLECTION_NAME)) {
        throw new TodoError(`Invalid collection name ${consts.TODOS_COLLECTION_NAME}`);
    }

    const repository = await getMongoDbRepository(config.mongodb.name, consts.TODOS_COLLECTION_NAME);

    controller = new Controller(repository);
    return controller;
};
