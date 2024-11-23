module.exports.toBoolean = function(p) {
    return (
        typeof p === 'boolean' ? p :
            typeof p === 'string' && p.toLowerCase() === 'true' ? true :
                typeof p === 'number' && p === 1
    );
};