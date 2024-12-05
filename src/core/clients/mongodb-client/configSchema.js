const Joi = require('joi');

const configSchema = Joi.object({
    url: Joi.string().required(),
    database: Joi.string().required(),
});

module.exports = configSchema;