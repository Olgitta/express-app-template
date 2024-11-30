const express = require('express');
const healthcheckRouter = express.Router();
const healthCheckController = require('./healthCheckController')();

healthcheckRouter.get('/healthcheck', async function(req, res, next) {
  res.json(await healthCheckController.healthCheck());
});

module.exports = healthcheckRouter;