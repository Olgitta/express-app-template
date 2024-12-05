const router = require('./v1/router');

module.exports = {
    v1: async () => await router(),
};