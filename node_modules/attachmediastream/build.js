var bundle = require('browserify')();
var fs = require('fs');


bundle.add('./attachmediastream');
bundle.bundle({standalone: 'attachMediaStream'}).pipe(fs.createWriteStream('attachmediastream.bundle.js'));
