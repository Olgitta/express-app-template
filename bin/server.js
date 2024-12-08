#!/usr/bin/env node

const http = require('http');
const appConfig = require('../src/config/appConfig').getAppConfig();
const initializeApp = require('../src/app');

(async () => {
    try {
        const app = await initializeApp(appConfig);
        console.log('App is ready');
        startServer(app, appConfig.port);
    } catch (error) {
        console.error('Failed to start the app:', error);
        process.exit(1);
    }
})();

function startServer(app, port) {
    const normalizedPort = normalizePort(port);
    app.set('port', normalizedPort);

    const server = http.createServer(app);

    server.listen(normalizedPort);
    server.on('error', (error) => onError(error, normalizedPort));
    server.on('listening', () => onListening(server));

    process.on('SIGINT', () => shutdown(server, 'SIGINT'));
    process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
}

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error, port) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(server) {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
}

function shutdown(server, signal) {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close((err) => {
        if (err) {
            console.error('Error during server shutdown:', err);
            process.exit(1);
        }
        console.log('Server shut down successfully.');
        process.exit(0);
    });
}
