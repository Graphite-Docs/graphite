var ready = require('./ready');

/**
  ### `sink(socket, opts?)`

  Create a pull-stream `Sink` that will write data to the `socket`.

  <<< examples/write.js

**/

var nextTick = typeof setImmediate !== 'undefined' ? setImmediate : process.nextTick

module.exports = function(socket, opts) {
  return function (read) {
    opts = opts || {}
    var closeOnEnd = opts.closeOnEnd !== false;
    var onClose = 'function' === typeof opts ? opts : opts.onClose;

    function next(end, data) {
      // if the stream has ended, simply return
      if (end) {
        if (closeOnEnd && socket.readyState <= 1) {
          if(onClose)
            socket.addEventListener('close', function (ev) {
              if(ev.wasClean || ev.code === 1006) onClose()
              else {
                var err = new Error('ws error')
                err.event = ev
                onClose(err)
              }
            });

          socket.close()
        }

        return;
      }

      // socket ready?
      ready(socket, function(end) {
        if (end) {
          return read(end, function () {});
        }
        socket.send(data);
        nextTick(function() {
          read(null, next);
        });
      });
    }

    read(null, next);
  }
}
