
module.exports = function (streams) {
  if(!Array.isArray(streams))
    streams = [].slice.call(arguments)
  var queue = []
  var ended = []
  var err
  return function (end, cb) {
    var n = streams.length
    queue = []
    streams.forEach(function (stream, i) {
      if(ended[i]) return next()
      stream(null, function (end, data) {
        if(end) ended[i] = end, queue[i] = null
        else    queue[i] = data
        next()
      })
    })

    function next() {
      if(--n) return
      var l = streams.length, end = 0
      while(l--)
        if(ended[l]) end ++

      if(end === streams.length)
        cb(true)
      else cb(null, queue)
    }
  }
}

