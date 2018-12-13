var bundle = require('browserify')();
var fs = require('fs');

bundle.add('./mediastream-gain');
bundle.bundle({standalone: 'MediaStreamGainController'}).pipe(fs.createWriteStream('mediastream-gain.bundle.js'));
