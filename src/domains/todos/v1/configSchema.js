'use strict';

const Joi = require('joi');
const TodoError = require('../TodoError');

const schema = Joi.object({
    mongodb: Joi.object({
        name: Joi.string().required(),
        whitelistedCollections: Joi.array().items(Joi.string()),
    })
});

module.exports.validateConfig = config => {
    const {error, value} = schema.validate(config || {});

    if (error) {
        throw new TodoError(error.message);
    }

    return value;
}