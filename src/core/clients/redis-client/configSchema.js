const Joi = require('joi');

const configSchema = Joi.object({
    url: Joi.string().required(),
    reconnectStrategy: Joi.object().keys({
        maxRetries: Joi.number().required(),
    })
});

module.exports = configSchema;