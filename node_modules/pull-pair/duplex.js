
var Pair = require('./')
module.exports = function () {
  var a = Pair(), b = Pair()
  return [
    {
      source: a.source,
      sink: b.sink
    },
    {
      source: b.source,
      sink: a.sink
    }
  ]
}
