var browserify = require('browserify'),
    fs = require('fs');

var bundle = browserify();
bundle.add('./hark');
bundle.bundle({standalone: 'hark'})
      .pipe(fs.createWriteStream('hark.bundle.js'));


var demo = browserify(['./example/demo.js'])
            .bundle()
            .pipe(fs.createWriteStream('./example/demo.bundle.js'));
