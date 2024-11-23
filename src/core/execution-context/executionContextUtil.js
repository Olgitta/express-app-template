const async_hooks = require('node:async_hooks');
const {v4: uuidv4} = require('uuid');

let ctx = new Map();

async_hooks.createHook({
    init: function (id, type, triggerAsyncId) {
        let triggeredData = ctx.get(triggerAsyncId);
        if (triggeredData) {
            ctx.set(id, triggeredData);
        }
    },
    destroy: function (asyncId) {
        ctx.delete(asyncId);
    }
}).enable();


module.exports.createCtx = (payload) => {
    let trxId = uuidv4();

    ctx.set(async_hooks.executionAsyncId(), {...payload, trxId});
};

module.exports.getCtx = () => {
    return ctx.get(async_hooks.executionAsyncId());
};

module.exports.getTransactionId = () => {
    return ctx.get(async_hooks.executionAsyncId()).trxId;
};