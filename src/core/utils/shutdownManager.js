'use strict';

const callbacks = [];

module.exports.registerShutdownCallback = (cb) => {
    callbacks.push(cb);
};

module.exports.getShutdownCallbacks = () => {
    return callbacks;
}