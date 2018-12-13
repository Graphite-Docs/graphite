var looper = require('looper')

module.exports = function (writer, ender) {
  return function (read) {
    var queue = [], ended, error

    function enqueue (data) {
      queue.push(data)
    }

    writer = writer || function (data) {
      this.queue(data)
    }

    ender = ender || function () {
      this.queue(null)
    }

    var emitter = {
      emit: function (event, data) {
        if(event == 'data') enqueue(data)
        if(event == 'end')  ended = true, enqueue(null)
        if(event == 'error') error = data
      },
      queue: enqueue
    }
    var _cb
    return function (end, cb) {
      ended = ended || end
      if(end)
        return read(end, function () {
          if(_cb) {
            var t = _cb; _cb = null; t(end)
          }
          cb(end)
        })

      _cb = cb
      looper(function pull (next) {
        //if it's an error
        if(!_cb) return
        cb = _cb
        if(error) _cb = null, cb(error)
        else if(queue.length) {
          var data = queue.shift()
          _cb = null,cb(data === null, data)
        }
        else {
          read(ended, function (end, data) {
             //null has no special meaning for pull-stream
            if(end && end !== true) {
              error = end; return next()
            }
            if(ended = ended || end)  ender.call(emitter)
            else if(data !== null) {
              writer.call(emitter, data)
              if(error || ended)
                return read(error || ended, function () {
                  _cb = null; cb(error || ended)
                })
            }
            next(pull)
          })
        }
      })
    }
  }
}

