var exports = module.exports = require('./duplex')

exports.source = require('./source');
exports.sink = require('./sink');
exports.createServer = require('./server')
exports.connect = require('./client')
