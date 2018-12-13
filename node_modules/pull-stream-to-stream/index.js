
var Stream = require('stream')

module.exports = duplex


module.exports.source = function (source) {
  return duplex(null, source)
}

module.exports.sink = function (sink) {
  return duplex(sink, null)
}

var next = (
  'undefined' === typeof setImmediate
  ? process.nextTick
  : setImmediate
)

function duplex (reader, read) {
  if(reader && 'object' === typeof reader) {
    read = reader.source
    reader = reader.sink
  }

  var cbs = [], input = [], ended, needDrain
  var s = new Stream()
  s.writable = s.readable = true
  s.write = function (data) {
    if(cbs.length)
      cbs.shift()(null, data)
    else
      input.push(data)

    if (!cbs.length) {
      needDrain = true
    }
    return !!cbs.length
  }

  s.end = function () {
    if(read) {
      if (input.length)
        drain()
      else
        read(ended = true, cbs.length ? cbs.shift() : function () {})
    } else if(cbs.length) {
      cbs.shift()(true)
    }
  }

  s.source = function (end, cb) {
    if(input.length) {
      cb(null, input.shift())
      if(!input.length)
        s.emit('drain')
    }
    else {
      if(ended = ended || end)
        cb(ended)
      else
        cbs.push(cb)

      if (needDrain) {
        needDrain = false
        s.emit('drain')
      }
    }
  }

  var n
  if(reader) n = reader(s.source)
  if(n && !read) read = n

  var output = [], _cbs = []
  var _ended = false, waiting = false, busy = false

  s.sink = function (_read) {
    read = _read
    next(drain)
  }

  if(read) {
    s.sink(read)

    var pipe = s.pipe.bind(s)
    s.pipe = function (dest, opts) {
      var res = pipe(dest, opts)

      if(s.paused) s.resume()

      return res
    }
  }

  function drain () {
    waiting = false
    if(!read || busy) return
    while(output.length && !s.paused) {
      s.emit('data', output.shift())
    }
    if(s.paused) return
    if(_ended)
      return s.emit('end')

    busy = true
    read(null, function next (end, data) {
      busy = false
      if(s.paused) {
        if(end === true) _ended = end
        else if(end) s.emit('error', end)
        else output.push(data)
        waiting = true
      } else {
        if(end && (ended = end) !== true)
          s.emit('error', end)
        else if(ended = ended || end) s.emit('end')
        else {
          s.emit('data', data)
          busy = true
          read(null, next)
        }
      }
    })
  }

  s.pause = function () {
    s.paused = true
    return s
  }

  s.resume = function () {
    s.paused = false
    drain()
    return s
  }

  s.destroy = function () {
    if(!ended && read)
      read(ended = true, function () {})
    ended = true
    if(cbs.length)
      cbs.shift()(true)

    s.emit('close')
  }

  return s
}
