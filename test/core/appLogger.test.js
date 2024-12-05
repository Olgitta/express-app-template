'use strict';

const appLogger = require('../../src/core/logger/appLogger');
const { getCtx } = require('../../src/core/execution-context/executionContextUtil');
const winston = require('winston');
const AppError = require("../../src/core/errors/AppError");

jest.mock('../../src/core/execution-context/executionContextUtil', () => ({
    getCtx: jest.fn(() => ({ traceId: 'test-trace-id' })),
}));

describe('appLogger', () => {
    let consoleSpy;

    beforeEach(() => {
        consoleSpy = jest.spyOn(winston.transports.Console.prototype, 'log');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should log info messages to the console', () => {
        appLogger.info('This is an info message', { key: 'value' });

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                level: 'info',
                message: 'This is an info message',
                key: 'value',
                traceId: 'test-trace-id',
            }),
            expect.any(Function)
        );
    });

    it('should log debug messages to the console', () => {
        appLogger.debug('This is a debug message', { debugKey: 'debugValue' });

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                level: 'debug',
                message: 'This is a debug message',
                debugKey: 'debugValue',
                traceId: 'test-trace-id',
            }),
            expect.any(Function)
        );
    });

    xit('should log error messages to the console', () => {
        const error = new AppError('Test error', 'ERR_TEST_CODE');
        // error.code = 'ERR_TEST';

        appLogger.error('An error occurred', error);

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                level: 'error',
                message: 'An error occurred Test error',
                    stack: expect.any(String),
                    name: expect.any(String),
                    code: 'ERR_TEST_CODE',
                traceId: 'test-trace-id',
                timestamp: expect.any(String),
            }),
            expect.any(Function)
        );
    });
});
