const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../api-spec/spec.json');
const healthcheckRouter = require('../core/healthcheck/healthcheckRouter');

module.exports = function setUpRoutes(app) {
    app.use('/api-spec', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/', healthcheckRouter);

    const todosRoutes = require('../domains/todos/routes');
    app.use('/api/:version/todos', (req, res, next) => {
        const router = todosRoutes[req.params.version];
        if (router) {
            return router(req, res, next);
        }
        res.status(400).send('Unsupported API version');
    });
}