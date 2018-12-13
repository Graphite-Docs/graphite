// Once there is an equivalent of getUserMedia for node.js,
// we'll update this to use it.
module.exports = function (constraints, cb) {
    var haveOpts = arguments.length === 2;

    // make constraints optional
    if (!haveOpts) {
        cb = constraints;
    }

    var error = new Error('MediaStreamError');
    error.name = 'NotSupportedError';
    return cb(error);
};
