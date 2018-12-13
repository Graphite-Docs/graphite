var fs = require('fs');
var path = require('path');
var keys = require(path.resolve(process.argv[2]));

var unpack = require('../');
console.dir({
    private : unpack(keys.private),
    public : unpack(keys.public),
});
