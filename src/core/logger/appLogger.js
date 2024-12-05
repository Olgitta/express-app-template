'use strict';

const { getCtx } = require('../execution-context/executionContextUtil');
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Default log level
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log' }),
        new transports.File({ filename: 'errors.log', level: 'error' }),

    ]
});

const appLogger = {
    info(msg, ...args) {
        logger.info(msg, Object.assign({}, ...args, getCtx()));
    },
    debug(msg, ...args) {
        logger.debug(msg, Object.assign({}, ...args, getCtx()));
    },
    error(msg, error) {
        const {message, stack, code} = error;
        logger.error(msg, error, getCtx());
    }
};

module.exports = appLogger;