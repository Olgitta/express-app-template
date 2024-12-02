module.exports.isStringEmpty = function (str) {
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string');
    }
    return str.trim().length === 0;
}