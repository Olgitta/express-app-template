const {createCtx} = require('./executionContextUtil');

const executionContextMiddleware = (req, res, next) => {

    const {url, method, params, query, body, cookies, headers} = req;
    createCtx({url, method, params, query, body});
    next();
};

module.exports = executionContextMiddleware;