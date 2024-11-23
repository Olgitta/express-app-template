const healthcheckRouter = require('../core/healthcheck/healthcheckRouter');

module.exports = function setUpRoutes(app) {
    app.use('/', healthcheckRouter);
}