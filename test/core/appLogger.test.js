'use strict';

const appLogger = require('../../src/core/logger/appLogger');
const { getCtx } = require('../../src/core/execution-context/executionContextUtil');
const winston = require('winston');

// Mock getCtx
jest.mock('../../src/core/execution-context/executionContextUtil', () => ({
    getCtx: jest.fn(),
}));

// Mock winston logger
jest.mock('winston', () => {
    const mockLogger = {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
    };

    return {
        createLogger: jest.fn(() => mockLogger),
        format: {
            combine: jest.fn(),
            timestamp: jest.fn(),
            json: jest.fn(),
        },
        transports: {
            Console: jest.fn(),
            File: jest.fn(),
        },
    };
});

describe('appLogger', () => {
    const mockContext = { requestId: '12345' };
    const loggerMethods = winston.createLogger();

    beforeEach(() => {
        jest.clearAllMocks();
        getCtx.mockReturnValue(mockContext);
    });

    it('should log info messages with merged context and args', () => {
        const message = 'Info message';
        const extraArgs = { key: 'value' };

        appLogger.info(message, extraArgs);

        expect(loggerMethods.info).toHaveBeenCalledWith(message, {
            key: 'value',
            ...mockContext,
        });
    });

    it('should log debug messages with merged context and args', () => {
        const message = 'Debug message';
        const extraArgs = { debugKey: 'debugValue' };

        appLogger.debug(message, extraArgs);

        expect(loggerMethods.debug).toHaveBeenCalledWith(message, {
            debugKey: 'debugValue',
            ...mockContext,
        });
    });

    it('should log error messages with merged context and args', () => {
        const message = 'Error message';
        const extraArgs = { errorCode: 500 };

        appLogger.error(message, extraArgs);

        expect(loggerMethods.error).toHaveBeenCalledWith(message, {
            errorCode: 500,
            ...mockContext,
        });
    });

    it('should not modify the original args when logging', () => {
        const message = 'Test immutability';
        const extraArgs = { immutableKey: 'originalValue' };

        appLogger.info(message, extraArgs);

        expect(extraArgs).toEqual({ immutableKey: 'originalValue' });
    });
});
