'use strict'

const pull = require('pull-stream')
const pullLP = require('pull-length-prefixed')
const debug = require('debug')

exports = module.exports

function randomId () {
  return ((~~(Math.random() * 1e9)).toString(36))
}

// prefixes a message with a varint
// TODO this is a pull-stream 'creep' (pull stream to add a byte?')
function encode (msg, callback) {
  const values = Buffer.isBuffer(msg) ? [msg] : [Buffer.from(msg)]

  pull(
    pull.values(values),
    pullLP.encode(),
    pull.collect((err, encoded) => {
      if (err) {
        return callback(err)
      }
      callback(null, encoded[0])
    })
  )
}

exports.writeEncoded = (writer, msg, callback) => {
  encode(msg, (err, msg) => {
    if (err) {
      return callback(err)
    }
    writer.write(msg)
  })
}

function createLogger (type) {
  const rId = randomId()

  function printer (logger) {
    return (msg) => {
      if (Array.isArray(msg)) {
        msg = msg.join(' ')
      }
      logger('(%s) %s', rId, msg)
    }
  }

  const log = printer(debug('mss:' + type))
  log.error = printer(debug('mss:' + type + ':error'))

  return log
}

exports.log = {}

exports.log.dialer = () => {
  return createLogger('dialer\t')
}
exports.log.listener = () => {
  return createLogger('listener\t')
}
