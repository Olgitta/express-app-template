const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../api-spec/spec.json');
const healthcheckRouter = require('../core/healthcheck/healthcheckRouter');

module.exports = async function setUpRoutes(app) {
    app.use('/api-spec', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/', healthcheckRouter);

    const todosRoutes = await require('../domains/todos/routes');
    const todosRoutesMap = new Map();

    for (let r in todosRoutes) {
        todosRoutesMap.set(r, await todosRoutes[r]());
    }

    app.use('/api/:version/todos', async (req, res, next) => {
        const router = todosRoutesMap.get(req.params.version);
        if (router) {
            return await router(req, res, next);
        }
        res.status(400).send('Unsupported API version');
    });
}