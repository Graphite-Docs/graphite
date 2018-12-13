var fs = require('fs');
var generator = require('..').generator;

var g = new generator();
g.pipe(fs.createWriteStream('example.log'));

for (var i=0; i<10; i++) {
  g.write({
    d: new Date(),
    count: i
  });
}
