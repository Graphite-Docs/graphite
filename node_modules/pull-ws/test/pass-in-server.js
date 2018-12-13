
var WS = require('../')
var tape = require('tape')
var pull = require('pull-stream')
var JSONDL = require('pull-json-doubleline')

tape('simple echo server', function (t) {
  var http_server = require('http').createServer()

  var server = WS.createServer({server: http_server}, function (stream) {
    pull(stream, pull.through(console.log), stream)
  })

  server.listen(5678, function () {
    WS.connect('ws://localhost:5678', function (err, stream) {
      pull(
        pull.values([1,2,3]),
        //need a delay, because otherwise ws hangs up wrong.
        //otherwise use pull-goodbye.
        function (read) {
          return function (err, cb) {
            setTimeout(function () {
              read(null, cb)
            }, 10)
          }
        },
        JSONDL.stringify(),
        stream,
        JSONDL.parse(),
        pull.collect(function (err, ary) {
          if(err) throw err
          t.deepEqual(ary, [1,2,3])
          server.close(function () {
            t.end()
          })
        })
      )
    })
  })



})







