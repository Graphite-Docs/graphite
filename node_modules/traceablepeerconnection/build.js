var bundle = require('browserify')({standalone: 'PeerConnection'}),
    fs = require('fs');


bundle.add('./index');
bundle.bundle().pipe(fs.createWriteStream('traceablepeerconnection.bundle.js'));
