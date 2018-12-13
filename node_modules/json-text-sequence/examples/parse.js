var parser = require('..').parser;
var fs = require('fs');

var p = new parser()
  .on('json', function(obj) {
    console.log('JSON:', obj);
  })
  .on('truncated', function(buf) {
    console.log('Truncated:', buf);
  })
  .on('invalid', function(buf) {
    console.log('Invalid:', buf);
  })
  .on('finish', function() {
    console.log('DONE');
  });

fs.createReadStream('example.log').pipe(p);
