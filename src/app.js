const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const setupRoutes = require('./routes');
const executionContextMiddleware = require('./core/execution-context/executionContextMiddleware');
const appConfig = require('./config/appConfig').getAppConfig();
const setupClients = require('./core/clients/index');
const appLogger = require("./core/logger/appLogger");

module.exports = async function initializeApp() {

    await setupClients(appConfig);

    const app = express();

    process.on('exit', async () => {
        appLogger.info('Execution process exited with exit', process.exitCode);
    });

    process.on('uncaughtException', (err, origin) => {
        appLogger.error('Uncaught Exception:', err, origin);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        appLogger.error('Unhandled Rejection:', reason, promise);
        process.exit(1);
    });

    if (process.env.NODE_ENV !== 'production') {
        app.use(logger('dev'));
    }

    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());

    app.use(executionContextMiddleware);
    setupRoutes(app);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
//     app.use(function (err, req, res, next) {
//         // set locals, only providing error in development
//         res.locals.message = err.message;
//         res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//         // render the error page
//         res.status(err.status || 500);
//         res.render('error');
//     });

    return app;
};
