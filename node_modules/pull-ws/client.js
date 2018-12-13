'use strict';

//load websocket library if we are not in the browser
var WebSocket = require('./web-socket')
var duplex = require('./duplex')
var wsurl = require('./ws-url')

function isFunction (f) {
  return 'function' === typeof f
}

module.exports = function (addr, opts) {
  if (isFunction(opts)) opts = {onConnect: opts}

  var location = typeof window === 'undefined' ? {} : window.location

  var url = wsurl(addr, location)
  var socket = new WebSocket(url)

  var stream = duplex(socket, opts)
  stream.remoteAddress = url
  stream.close = function (cb) {
    if (isFunction(cb)) {
      socket.addEventListener('close', cb)
    }
    socket.close()
  }

  socket.addEventListener('open', function (e) {
    if (opts && isFunction(opts.onConnect)) {
      opts.onConnect(null, stream)
    }
  })

  return stream
}

module.exports.connect = module.exports
