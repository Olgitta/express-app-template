const async_hooks = require('node:async_hooks');
const {v4: uuidv4} = require('uuid');

const ctx = new Map();

async_hooks.createHook({
    init: function (id, type, triggerAsyncId) {
        const triggeredData = ctx.get(triggerAsyncId);
        if (triggeredData) {
            ctx.set(id, triggeredData);
        }
    },
    destroy: function (asyncId) {
        ctx.delete(asyncId);
    }
}).enable();


module.exports.createCtx = (payload) => {
    const transactionId = uuidv4();

    ctx.set(async_hooks.executionAsyncId(), {...payload, transactionId});
};

module.exports.getCtx = () => {
    return ctx.get(async_hooks.executionAsyncId());
};

module.exports.getTransactionId = () => {
    return ctx.get(async_hooks.executionAsyncId()).transactionId;
};