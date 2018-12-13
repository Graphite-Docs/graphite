var pull = require('pull-stream')
var File = require('../')


module.exports = function (file, cb) {
  var start = Date.now(), total = 0
  pull(
    File(file),
    pull.drain(function (b) {
      total += b.length
    }, function (err) {
      cb(null, {time: Date.now() - start, total: total})
    })
  )
}



if(!module.parent)
  module.exports (process.argv[2], function (err, stats) {
    var seconds = stats.time/1000, mb = stats.total/(1024*1024)
    console.log(seconds, mb, mb/seconds)
  })



