function abortable(onEnd) {
  var aborted = false, reading = false, ended = false, _cb, _read

  function doEnd () {
    if(!onEnd) return
    if(aborted && aborted !== true) return onEnd(aborted)
    if(ended && ended !== true) return onEnd(ended)
    return onEnd(null)
  }

  function terminate (err) {
    doEnd()
    var cb = _cb; _cb = null
    if(cb) cb(aborted || ended)
  }

  function cancel () {
    ended = ended || true
    terminate(aborted || ended)
    if(_read)
      _read(aborted, function (err) {
        if(_cb) _cb(err||aborted)
      })
  }

  function reader (read) {
    _read = read
    return function (abort, cb) {
      _cb = cb
      if(abort)   aborted = abort
      if(ended)   return cb(ended)
      if(aborted) return
      reading = true
      read(abort, function (end, data) {
        reading = false
        if(aborted) return !abort && read(aborted, function () {})
        if(!_cb) return
        var cb = _cb
        _cb = null
        if(end) {
          ended = aborted || end
          doEnd()
          cb(aborted || end)
        }
        else {
          cb(aborted || end, data)
        }
      })
    }
  }

  reader.abort = function (err) {
    if(ended) return
    aborted = err || true
    cancel()
  }

  return reader
}

module.exports = abortable



