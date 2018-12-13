
var Decode = require('string_decoder').StringDecoder

module.exports = function (enc) {
  var decoder = new Decode(enc), ended
  return function (read) {
    return function (abort, cb) {
      if(ended) return cb(ended)
      read(abort, function (end, data) {
        ended = end
        if(true === end) {
          if(data = decoder.end()) cb(null, data)
          else                     cb(true)
        }
        else if(end && (true !== end))
          cb(end)
        else
          cb(null, decoder.write(data))
      })
    }
  }
}
