module.exports.toBoolean = function(p) {

    if(typeof p === 'boolean') return p;

    if(typeof p === 'number' && p === 1) return true;

    if(typeof p === 'string' && p === '1') return true;

    return typeof p === 'string' && p.toLowerCase() === 'true';

};