var bundle = require('browserify')({ standalone: 'getUserMedia' }),
    fs = require('fs');


bundle.add('./index-browser');
bundle.bundle().pipe(fs.createWriteStream('getusermedia.bundle.js'));
