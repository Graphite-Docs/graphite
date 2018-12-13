'use strict'

const io = require('socket.io-client')
const pull = require('../src')
const sioOptions = {
  transports: ['websocket'],
  'force new connection': true
}
const parallel = require('async/parallel')

const connectNClients = (count, url, cb) => {
  let clients = []
  for (var i = 0; i < count; i++) {
    const client = io.connect(url, sioOptions)
    pull(client, {codec: 'buffer'})
    clients.push(client)
  }
  parallel(clients.map(c => done => {
    c.once('connect', done)
    c.once('connect_error', done)
    c.once('error', done)
  }), err => {
    if (err) return cb(err)
    parallel(clients.map(c => done => {
      c.on('ack', f => f())
      c.emit('hello')
      c.once('world', id => {
        c._id = id
        done()
      })
    }), err => {
      if (err) return cb(err)
      return cb(null, clients)
    })
  })
}

module.exports = url => {
  return {
    two: cb => connectNClients(2, url, cb),
    one: cb => connectNClients(1, url, cb),
    n: (count, cb) => connectNClients(count, url, cb)
  }
}

module.exports.default = () => module.exports('http://localhost:5982')
