
var Source = require('pull-defer/source')
var error = require('pull-stream/sources/error')
var values = require('pull-stream/sources/values')
var collect = require('pull-stream/sinks/collect')

module.exports = function (compare) {
  var source = Source()

  var sink = collect(function (err, ary) {
    if (err) {
      return source.resolve(error(err))
    }

    source.resolve(values(ary.sort(compare)))
  })

  return function (read) {
    sink(read)
    return source
  }
}
