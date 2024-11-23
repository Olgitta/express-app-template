#!/usr/bin/env node

const appConfig = require('../src/config/appConfig');

const initializeApp = require('../src/app');

initializeApp()
    .then((app) => {
        console.log('App is ready');
        startServer(app);
    })
    .catch((error) => {
        console.error('Failed to start the app:', error);
        process.exit(1);
    });

function startServer(app) {

    const http = require('http');

    const port = normalizePort(appConfig.port);
    app.set('port', port);

    const server = http.createServer(app);

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

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

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onListening() {
        const addr = server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        console.log('Listening on ' + bind);
    }
}