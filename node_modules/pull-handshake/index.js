var Reader = require('pull-reader')
var Writer = require('pull-pushable')
var cat = require('pull-cat')
var pair = require('pull-pair')

function once (cb) {
  var called = 0
  return function (a, b, c) {
    if(called++) return
    cb(a, b, c)
  }
}

function isFunction (f) {
  return 'function' === typeof f
}

module.exports = function (opts, _cb) {
  if(isFunction(opts)) _cb = opts, opts = {}
  _cb = once(_cb || function noop () {})
  var reader = Reader(opts && opts.timeout || 5e3)
  var writer = Writer(function (err) {
    if(err) _cb(err)
  })

  var p = pair()

  return {
    handshake: {
      read: reader.read,
      abort: function (err) {
        writer.end(err)
        reader.abort(err, function (err) {
        })
        _cb(err)
      },
      write: writer.push,
      rest: function () {
        writer.end()
        return {
          source: reader.read(),
          sink: p.sink
        }
      }
    },
    sink: reader,
    source: cat([writer, p.source])
  }
}
