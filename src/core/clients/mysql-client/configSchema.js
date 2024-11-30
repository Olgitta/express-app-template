const Joi = require('joi');

const configSchema = Joi.object({
    host: Joi.string().required(),
    user: Joi.string().required(),
    password: Joi.string(),
    database: Joi.string(),
});

module.exports = configSchema;