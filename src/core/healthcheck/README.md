Here is a README for the `HealthCheckController` module:

---

# HealthCheckController

This module provides an API to check the health status of multiple services, including MySQL, Redis, and MongoDB. It returns the status of these services and the process signals `SIGINT` and `SIGTERM` listeners.

### Health Check Response

The `healthCheck()` method will return a response in the following format:

```json
{
  "data": {
    "processListeners": {
      "sigint": ["listener1", "listener2"],
      "sigterm": ["listener1"]
    },
    "clients": {
      "mysql": "OK" | "ERROR",
      "redis": "OK" | "ERROR",
      "mongodb": "OK" | "ERROR"
    }
  },
  "message": "OK",
  "transactionId": "<transaction_id>"
}
```

- **processListeners**: Lists the names of listeners attached to `SIGINT` and `SIGTERM` signals.
- **clients**: Health status of the connected services (`mysql`, `redis`, `mongodb`).
- **message**: A default status message (`OK`).
- **transactionId**: Unique transaction ID fetched from the execution context.

## Methods

### `healthCheck()`

This method performs health checks for MySQL, Redis, and MongoDB by pinging each service. If any of the services fail to respond, the corresponding client status will be marked as `ERROR`. It also checks the listeners for `SIGINT` and `SIGTERM` events.

- **Returns**: A response object with the health status and transaction ID.

## Logging

The health check will log errors using the `appLogger` whenever a client (MySQL, Redis, or MongoDB) fails to respond.

## Singleton Pattern

The `HealthCheckController` uses the singleton pattern. This means that only one instance of `HealthCheckController` will be created, even if you call `getHealthCheckController()` multiple times.
