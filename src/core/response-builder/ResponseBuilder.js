'use strict';

class ResponseBuilder {
    constructor() {
        this.response = {
            metadata: {
                transactionId: '',
                message: '',
                // error: ''    // optional
            },
        };
    }

    /**
     * Set the transactionId for the response
     * @param {string} transactionId
     * @returns {ResponseBuilder}
     */
    setTransactionId(transactionId) {
        this.response.metadata.transactionId = transactionId;
        return this;
    }

    /**
     * Set the message for the response
     * @param {string} message
     * @returns {ResponseBuilder}
     */
    setMessage(message) {
        this.response.metadata.message = message;
        return this;
    }

    /**
     *
     * @param error
     * @returns {ResponseBuilder}
     */
    setError(error) {
        if (!error) {
            return this;
        }
        if (process.env.NODE_ENV !== 'production') {
            this.response.metadata.error = {
                code: error.code,
            };
        }

        return this;
    }


    /**
     * Set the data for the response
     * @param {any} data
     * @returns {ResponseBuilder}
     */
    setData(data) {
        if (data !== null && data !== undefined) {
            this.response.data = data;
        }
        return this;
    }

    /**
     * Build the response object
     * @returns {object}
     */
    build() {
        return this.response;
    }
}

module.exports = ResponseBuilder;