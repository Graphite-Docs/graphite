Server = require('../lib/server')

var server = new Server({ port: 9994, path: '/'})
server.on('error', function (e) { cb(null, e); })
server.on('testMethod', function (err, params, callback) {
  setTimeout(function () {
    callback(null, 1)
    console.log('LOOKS GOOD')
  }, 5000);
})