'use strict';

const Joi = require('joi');
const appLogger = require("../../../core/logger/appLogger");

const schema = Joi.object({
    title: Joi.string().required(),
    completed: Joi.boolean().required(),
});

module.exports.schema = schema;

module.exports.isValid = todo => {
    const {error, value} = schema.validate(todo || {});

    if (error) {
        appLogger.error('Todo validation failed', {
            source: todo,
            error: {...error}
        });

        return false;
    }

    appLogger.debug('Todo validation success', {
        source: todo,
        value: {...value}
    });
    return true;
}