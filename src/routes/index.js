const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../api-spec/spec.json');
const healthcheckRouter = require('../core/healthcheck/healthcheckRouter');

module.exports = function setUpRoutes(app) {
    app.use('/api-spec', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/', healthcheckRouter);
}