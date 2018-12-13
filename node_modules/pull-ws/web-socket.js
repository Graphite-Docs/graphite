
module.exports = 'undefined' === typeof WebSocket ? require('ws') : WebSocket
