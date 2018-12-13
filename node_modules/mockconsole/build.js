var bundle = require('browserify')(),
    fs = require('fs');


bundle.add('./mockconsole');
bundle.bundle({standalone: 'mockconsole'}).pipe(fs.createWriteStream('mockconsole.umd.js'));
