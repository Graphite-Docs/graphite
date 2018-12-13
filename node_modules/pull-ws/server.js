var ws = require('./')
var WebSocket = require('ws')
var url = require('url')
var http = require('http')
var https = require('https')

var EventEmitter = require('events').EventEmitter
module.exports = !WebSocket.Server ? null : function (opts, onConnection) {
    var emitter = new EventEmitter()
    var server
    if (typeof opts === 'function'){
      onConnection = opts
      opts = null
    }
    opts = opts || {}

    if(onConnection)
      emitter.on('connection', onConnection)

    function proxy (server, event) {
      return server.on(event, function () {
        var args = [].slice.call(arguments)
        args.unshift(event)
        emitter.emit.apply(emitter, args)
      })
    }

    var server = opts.server ||
      (opts.key && opts.cert ? https.createServer(opts) : http.createServer())

    var wsServer = new WebSocket.Server({
      server: server,
      perMessageDeflate: false,
      verifyClient: opts.verifyClient
    })

    proxy(server, 'listening')
    proxy(server, 'request')
    proxy(server, 'close')

    wsServer.on('connection', function (socket) {
      var stream = ws(socket)
      stream.remoteAddress = socket.upgradeReq.socket.remoteAddress
      emitter.emit('connection', stream)
    })

    emitter.listen = function (addr, onListening) {
      if(onListening)
        emitter.once('listening', onListening)
      server.listen(addr.port || addr)
      return emitter
    }

    emitter.close = function (onClose) {
      server.close(onClose)
      wsServer.close()
      return emitter
    }

    emitter.address = server.address.bind(server)
    return emitter
  }





