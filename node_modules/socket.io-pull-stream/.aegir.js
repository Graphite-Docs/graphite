'use strict'

const SIO = require('socket.io')
// const pull = require('pull-stream')
const http = require('http')
const sp = require('./src')
let io, serv

const routingTable = {}

function boot (done) {
  serv = http.createServer(() => {})
  io = SIO(serv)
  io.on('connection', client => {
    sp(client, {codec: 'buffer'})

    client.on('ack', ack => ack())

    client.on('createProxy', (id, to, f) => {
      to = routingTable[to]
      client.createProxy(id, to)
      if (f) to.emit('ack', f)
    })

    client.on('hello', () => client.emit('world', client.id))

    routingTable[client.id] = client
  })

  serv.listen(5982, done)
}

function stop (done) {
  serv.close(done)
}

module.exports = {
  hooks: {
    pre: boot,
    post: stop
  }
}
