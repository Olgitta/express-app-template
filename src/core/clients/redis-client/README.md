# Redis Client Module

This module provides a function to create and manage a Redis client connection with enhanced configuration, error handling, and graceful shutdown capabilities.

## Features
- Validates Redis configuration using a schema (`configSchema`).
- Configurable retry strategy for reconnection.
- Graceful shutdown on process termination (`SIGINT`, `SIGTERM`).
- Logs connection lifecycle and errors using `appLogger`.
- Throws a custom error (`RedisClientError`) if the maximum retry limit is reached.

---

## Installation

```bash
npm install redis
```

Ensure you have `redis`, `joi` (for schema validation), and a logging utility like `winston` or similar to use this module effectively.

---

## Usage

### Import the Module
```javascript
const getRedisClient = require('./path/to/redisClient');
```

### Example Configuration
```javascript
const redisConfig = {
    url: 'redis://localhost:6379',
    reconnectStrategy: {
        maxRetries: 5, // Maximum number of retry attempts
    },
};
```

### Initialize Redis Client
```javascript
(async () => {
    try {
        const redisClient = await getRedisClient(redisConfig);

        // Use the redisClient for operations
        await redisClient.set('key', 'value');
        const value = await redisClient.get('key');
        console.log('Value:', value);

    } catch (err) {
        console.error('Failed to initialize Redis client:', err.message);
    }
})();
```

---

## Configuration Schema

The `config` object passed to `getRedisClient` must follow the schema defined in `configSchema`.

### Required Fields
- **`url`**: The Redis server connection URL (e.g., `redis://localhost:6379`).
- **`reconnectStrategy.maxRetries`**: Maximum number of retries for reconnection.

### Example
```javascript
{
    url: "redis://localhost:6379",
    reconnectStrategy: {
        maxRetries: 5
    }
}
```

---

## Error Handling

The module throws errors in the following cases:
1. **Configuration Validation Error**: If the configuration does not match the schema.
   ```javascript
   throw new Error('Redis configuration validation error');
   ```
2. **Max Retries Reached**: A custom error (`RedisClientError`) is thrown when the maximum number of retries is exceeded.

   Example:
   ```javascript
   throw new RedisClientError('Max retries reached', 'MAXRETRYREACHED');
   ```

---

## Graceful Shutdown

The module handles application termination signals (`SIGINT`, `SIGTERM`) to close the Redis connection gracefully:
```javascript
const gracefulShutdown = async () => {
    appLogger.info('Closing Redis connection...');
    await client.quit();
    appLogger.info('Redis connection closed');
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
```

---

## Logging

The module uses `appLogger` to log important events:
- Redis connection errors.
- Successful connection establishment.
- Connection closure during shutdown.

### Example Logs
- `Redis connection opened`
- `Redis Error: Connection lost`
- `Max retries reached: 5`
- `Closing Redis connection...`
- `Redis connection closed`

---