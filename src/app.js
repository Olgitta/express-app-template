const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const setupRoutes = require('./routes');
const executionContextMiddleware = require('./core/execution-context/executionContextMiddleware');
const setupClients = require('./core/clients/index');
const appLogger = require('./core/logger/appLogger');

module.exports = async function initializeApp(appConfig) {

    await setupClients(appConfig);

    const app = express();

    process.on('exit', async () => {
        try {
            appLogger.info('Execution process exited. Exit code:', process.exitCode);
        } catch (err) {
            console.error('Error during process exit logging:', err);
        }
    });

    process.on('uncaughtException', (err, origin) => {
        appLogger.fatal('Uncaught Exception:', { error: err.message, stack: err.stack });
        setTimeout(() => process.exit(0), 5000).unref();
    });

    process.on('unhandledRejection', (reason, promise) => {
        appLogger.error(`Unhandled Rejection: ${reason.message}`);
    });

    if (process.env.NODE_ENV !== 'production') {
        app.use(logger('dev'));
    }

    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(executionContextMiddleware);

    setupRoutes(app, appConfig);

    return app;
};
