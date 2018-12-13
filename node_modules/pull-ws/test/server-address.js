var WS = require('../')
var tape = require('tape')

tape('server .address should return bound address', function (t) {
  var server = WS.createServer().listen(55214, function () {
    t.equal(typeof server.address, 'function')
    t.equal(server.address().port, 55214, 'return address should match')
    server.close(function () {
      t.end()
    })
  })
})
