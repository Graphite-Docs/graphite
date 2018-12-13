var bundle = require('browserify')(),
    fs = require('fs');


bundle.add('./filetransfer');
bundle.bundle({standalone: 'FileTransfer'}).pipe(fs.createWriteStream('filetransfer.bundle.js'));
