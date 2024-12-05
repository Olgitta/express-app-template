'use strict';

class TodoError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports.TodoError = TodoError;

module.exports.errorCode = {
    GENERAL_ERROR: 1111,
    TODO_VALIDATION_ERROR: 1001,
    TODO_INSERT_INTO_DB_ERROR: 1002,
    TODO_UPDATE_ON_DB_ERROR: 1003,
}