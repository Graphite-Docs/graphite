'use strict'

//a pair of pull streams where one drains from the other
module.exports = function () {
  var _read, waiting
  function sink (read) {
    if('function' !== typeof read)
      throw new Error('read must be function')

    if(_read)
      throw new Error('already piped')
    _read = read
    if(waiting) {
      var _waiting = waiting
      waiting = null
      _read.apply(null, _waiting)
    }
  }
  function source (abort, cb) {
    if(_read)
      _read(abort, cb)
    else
      waiting = [abort, cb]
  }

  return {
    source: source, sink: sink
  }
}

