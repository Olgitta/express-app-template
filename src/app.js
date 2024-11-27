const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const setupRoutes = require('./routes');
const executionContextMiddleware = require('./core/execution-context/executionContextMiddleware');
const appConfig = require('../src/config/appConfig');
const getRedisClient = require("./core/clients/redis-client/redisClient");

module.exports = async function initializeApp() {

    if(appConfig.redisIsOn) {
        const getRedisClient = require('./core/clients/redis-client/redisClient');
        await getRedisClient(appConfig.redis);
    }


    if(appConfig.mongoIsOn) {
        const getMongoClient = require('./core/clients/mongodb-client/mongodbClient');
        await getMongoClient(appConfig.mongo);
    }

    const app = express();

    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection:', reason);
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
