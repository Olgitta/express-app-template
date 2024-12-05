module.exports.isValidNonEmptyString = function (v) {
    if (typeof v !== 'string') {
        return false;
    }

    return v.trim().length > 0;
}

module.exports.isBoolean = function (v) {
    return typeof v === 'boolean';
}