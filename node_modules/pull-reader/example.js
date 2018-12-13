
var Reader = require('pull-reader')
var box = require('pull-box-stream')
var pCont = require('pull-cont')
var randomBytes = require('crypto').randomBytes
var pull = require('pull-stream')

//key is 32 bytes and nonce is 24 bytes, written to start of stream.

exports.unbox = function UnboxStreamWithNonce (key) {

  var reader = Reader(1000) //timeout, 1 second

  //remember, a through pull-stream is a sink stream (takes a "read", calls it)
  return function (read) {
    pull(read, reader)

    //that returns a source stream, return a "read"
    return pCont(function (cb) {
      reader.read(24, function (err, nonce) {
        if(err) return cb(err)

        var source = function (abort, cb) {
          if(abort) reader.abort(abort, cb)
          else reader.read(null, cb)
        }

        cb(null, pull(source, box.createUnboxStream(key, nonce))
      })

    }
  }
}


exports.box = function (key) {

  var nonce = randomBytes(24)

  return Cat([pull.values([nonce], box.createBoxStream(key, nonce))])

}

if(!module.parent) {
  var crypto = require('crypto')
  var toPull = require('stream-to-pull-stream')
  var key = crypto.createHash('sha256').update(process.argv[3]).digest()

  pull(
    toPull.source(process.stdin)),
    exports[process.arv[2]),
    toPull.sink(process.stdout)
  )

}

