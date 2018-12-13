var through = require('pull-through')

module.exports = function split (matcher, mapper, reverse, last) {
  var soFar = ''
  if('function' === typeof matcher)
    mapper = matcher, matcher = null
  if (!matcher)
    matcher = '\n'

  function map(stream, piece) {
    if(mapper) {
      piece = mapper(piece)
      if('undefined' !== typeof piece)
        stream.queue(piece)
    }
    else
      stream.queue(piece)
  }

  return through(function (buffer) {
    var stream = this
      , pieces = ( reverse
        ? buffer + soFar
        : soFar + buffer
      ).split(matcher)

    soFar = reverse ? pieces.shift() : pieces.pop()
    var l = pieces.length
    for (var i = 0; i < l; i++) {
      map(stream, pieces[reverse ? l - 1 - i : i ])
    }
  },
  function () {
    if(last && soFar == '')
      return this.queue(null)
    else (soFar != null) // && (last && soFar != ''))
      map(this, soFar)

    this.queue(null)
  })
}




