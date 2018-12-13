var varint = require('varint')
var stream = require('readable-stream')
var util = require('util')
var bufferAlloc = require('buffer-alloc-unsafe')

var pool = bufferAlloc(10 * 1024)
var used = 0

var Encoder = function () {
  if (!(this instanceof Encoder)) return new Encoder()
  stream.Transform.call(this)
  this._destroyed = false
}

util.inherits(Encoder, stream.Transform)

Encoder.prototype._transform = function (data, enc, cb) {
  if (this._destroyed) return cb()

  varint.encode(data.length, pool, used)
  used += varint.encode.bytes

  this.push(pool.slice(used - varint.encode.bytes, used))
  this.push(data)

  if (pool.length - used < 100) {
    pool = bufferAlloc(10 * 1024)
    used = 0
  }

  cb()
}

Encoder.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true
  if (err) this.emit('error', err)
  this.emit('close')
}

module.exports = Encoder
