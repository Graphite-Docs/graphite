var fs = require('fs');
var path = require('path');
var keys = require(path.resolve(process.argv[2] || 'keys.json'));

var unpack = require('../');
var rsa = unpack(keys.private);
console.dir(rsa);
