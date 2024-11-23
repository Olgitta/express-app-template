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
    info(message, ...args) {
        logger.info(message, Object.assign({}, ...args, getCtx()));
    },
    debug(message, ...args) {
        logger.debug(message, Object.assign({}, ...args, getCtx()));
    },
    error(message, ...args) {
        logger.error(message, Object.assign({}, ...args, getCtx()));
    }
};

module.exports = appLogger;