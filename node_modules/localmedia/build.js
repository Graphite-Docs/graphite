var bundle = require('browserify')();
var fs = require('fs');

bundle.add('./index');
bundle.bundle({standalone: 'LocalMedia'}).pipe(fs.createWriteStream('localMedia.bundle.js'));
