'use strict';

const appLogger = require('../../../core/logger/appLogger');
const {getMongoDbRepository} = require('../../../core/clients/mongodb-client/mongodbRepositoryFactory');
const {isValid} = require("./todoSchema");
const {StatusCodes, ReasonPhrases} = require("http-status-codes");
const Todo = require('./TodoModel');

async function handleRequest(callback) {
    try {
        const repository = await getMongoDbRepository('devel', 'todos');
        return await callback(repository);
    } catch (error) {
        appLogger.error(`Todos error: ${error.message}`, error);
        return {
            error: error.message,
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            data: null,
        };
    }
}

/**
 *
 * @returns {Promise<*|{data: null, error: *, status: StatusCodes.INTERNAL_SERVER_ERROR}|undefined>}
 */
module.exports.getAll = async () => {
    return await handleRequest(async (repository) => {
        const data = await repository.getAll();
        return {
            error: null,
            status: StatusCodes.OK,
            data,
        }
    });
}

/**
 *
 * @param requestBody
 * @returns {Promise<*|{data: null, error: *, status: StatusCodes.INTERNAL_SERVER_ERROR}|undefined>}
 */
module.exports.create = async (requestBody) => {
    return await handleRequest(async (repository) => {

        const {title, completed} = requestBody;

        const todo = new Todo();
        todo.title = title;
        todo.completed = completed;

        if (!isValid(todo.map())) {
            return {
                error: new Error(ReasonPhrases.BAD_REQUEST),
                status: StatusCodes.BAD_REQUEST,
                data: null
            }
        }

        const created = await repository.insertWithTimestamps(todo.map());

        return {
            error: null,
            status: StatusCodes.CREATED,
            data: created
        }
    });

}