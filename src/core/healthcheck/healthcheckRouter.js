const express = require('express');
const healthcheckRouter = express.Router();
const healthCheckController = require('./healthCheckController')();

healthcheckRouter.get('/healthcheck', function(req, res, next) {
  res.json(healthCheckController.healthCheck());
});

module.exports = healthcheckRouter;