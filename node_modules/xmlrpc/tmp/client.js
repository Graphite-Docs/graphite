var Client = require('../lib/client')
var http = require('http')

var options = { host: 'localhost', port: 9994, path: '/', method: 'POST' }
var chunk1 = '<?xml version="1.0" encoding="UTF-8"?>'
	+ '<methodCall>'
	+ '<methodName>testMethod</methodName>'
	+ '<params>'
	+ '<param>'
	+ '<value><string>Param A</string></value>'
	+ '</param>'
	+ '<param>'
	+ '<value><string>Param B</string></value>'
	+ '</param>'
	+ '</params>'
	+ '</methodCall>';

var req = http.request(options, function(res) {
	setTimeout(function () { console.log('too late'); }, 5000)
})

req.on('error', function(e) {
//do nothing
})
req.write(chunk1);
req.end();
//setTimeout(function () { req.abort(); }, 10)

