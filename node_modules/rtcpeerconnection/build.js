var bundle = require('browserify')({standalone: 'PeerConnection'}),
    fs = require('fs');


bundle.add('./rtcpeerconnection');
bundle.bundle().pipe(fs.createWriteStream('rtcpeerconnection.bundle.js'));
