var stream = require('readable-stream')
var util = require('util')
var rabin = require('bindings')('rabin')
var BufferList = require('bl')
var debug = require('debug')('rabin')

module.exports = Rabin

function Rabin (opts) {
  if (!(this instanceof Rabin)) return new Rabin(opts)
  if (!opts) opts = {}
  stream.Duplex.call(this)
  this._readableState.highWaterMark = 16
  this._readableState.objectMode = true
  this.destroyed = false
  var avgBits = +opts.bits || 12
  var min = +opts.min || 8 * 1024
  var max = +opts.max || 32 * 1024
  this.rabin = rabin.rabin()
  this.rabin.configure(avgBits, min, max)
  this.nextCb = null
  this.buffers = new BufferList()
  this.pending = []
  this.on('finish', this._finish)
}

util.inherits(Rabin, stream.Duplex)

Rabin.prototype._finish = function () {
  if (this.destroyed) return
  if (this.buffers.length) this.push(this.buffers.slice(0, this.buffers.length))
  this.push(null)
}

Rabin.prototype._writev = function (batch, cb) {
  if (this.destroyed) return cb()

  for (var i = 0; i < batch.length; i++) {
    this.buffers.append(batch[i].chunk)
    this.pending.push(batch[i].chunk)
  }
  this._process(cb)
}

Rabin.prototype._read = function (size) {
  var nextCb = this.nextCb
  if (nextCb) {
    this.nextCb = null
    nextCb()
  }
}

Rabin.prototype._write = function (data, enc, cb) {
  if (this.destroyed) return cb()

  this.buffers.append(data)
  this.pending.push(data)
  this._process(cb)
}

Rabin.prototype._process = function (cb) {
  var drained = true
  var sizes = []
  this.rabin.fingerprint(this.pending, sizes)
  this.pending = []

  debug('chunks', sizes)

  for (var i = 0; i < sizes.length; i++) {
    var size = sizes[i]
    var buf = this.buffers.slice(0, size)
    this.buffers.consume(size)
    drained = this.push(buf)
  }

  if (drained) cb()
  else this.nextCb = cb
}

Rabin.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  if (err) this.emit('error', err)
  this.emit('close')
}
