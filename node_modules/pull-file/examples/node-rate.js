

var fs = require('fs')

module.exports = function (file, cb) {
  var start = Date.now(), total = 0
  fs.createReadStream(file)
    .on('data', function (b) {
      total += b.length
    })
    .on('end', function () {
      cb(null, {time: Date.now() - start, total: total})
    })
}

if(!module.parent)
  module.exports (process.argv[2], function (err, stats) {
    var seconds = stats.time/1000, mb = stats.total/(1024*1024)
    console.log(seconds, mb, mb/seconds)
  })


