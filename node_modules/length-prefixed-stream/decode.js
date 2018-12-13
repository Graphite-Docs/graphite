var varint = require('varint')
var stream = require('readable-stream')
var util = require('util')
var bufferAlloc = require('buffer-alloc-unsafe')

var Decoder = function (opts) {
  if (!(this instanceof Decoder)) return new Decoder(opts)
  stream.Transform.call(this)

  this._destroyed = false
  this._missing = 0
  this._message = null
  this._limit = opts && opts.limit || 0
  this._allowEmpty = !!(opts && opts.allowEmpty)
  this._prefix = bufferAlloc(this._limit ? varint.encodingLength(this._limit) : 100)
  this._ptr = 0

  if (this._allowEmpty) {
    this._readableState.highWaterMark = 16
    this._readableState.objectMode = true
  }
}

util.inherits(Decoder, stream.Transform)

Decoder.prototype._push = function (message) {
  this._ptr = 0
  this._missing = 0
  this._message = null
  this.push(message)
}

Decoder.prototype._parseLength = function (data, offset) {
  for (offset; offset < data.length; offset++) {
    if (this._ptr >= this._prefix.length) return this._prefixError(data)
    this._prefix[this._ptr++] = data[offset]
    if (!(data[offset] & 0x80)) {
      this._missing = varint.decode(this._prefix)
      if (this._limit && this._missing > this._limit) return this._prefixError(data)
      if (!this._missing && this._allowEmpty) this._push(bufferAlloc(0))
      this._ptr = 0
      return offset + 1
    }
  }
  return data.length
}

Decoder.prototype._prefixError = function (data) {
  this.destroy(new Error('Message is larger than max length'))
  return data.length
}

Decoder.prototype._parseMessage = function (data, offset) {
  var free = data.length - offset
  var missing = this._missing

  if (!this._message) {
    if (missing <= free) { // fast track - no copy
      this._push(data.slice(offset, offset + missing))
      return offset + missing
    }
    this._message = bufferAlloc(missing)
  }

  // TODO: add opt-in "partial mode" to completely avoid copys
  data.copy(this._message, this._ptr, offset, offset + missing)

  if (missing <= free) {
    this._push(this._message)
    return offset + missing
  }

  this._missing -= free
  this._ptr += free

  return data.length
}

Decoder.prototype._transform = function (data, enc, cb) {
  var offset = 0

  while (!this._destroyed && offset < data.length) {
    if (this._missing) offset = this._parseMessage(data, offset)
    else offset = this._parseLength(data, offset)
  }

  cb()
}

Decoder.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true
  if (err) this.emit('error', err)
  this.emit('close')
}

module.exports = Decoder
