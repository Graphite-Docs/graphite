var pull = require('pull-stream')

var WS = require('../')

var start = Date.now()

var server = WS.createServer(function (stream) {
  var N = 0
  pull(stream, pull.drain(function (n) {
    if(!(N%1000)) console.log(N)
    N++
  }, function () {
    console.log(N, N / ((Date.now() - start)/1000))
    server.close()
  }))
}).listen(2134)

pull(
  pull.count(10000),
  pull.map(function (n) { return '?' }),
  WS.connect('ws://localhost:2134')
)
