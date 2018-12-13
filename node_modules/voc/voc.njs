#!/usr/bin/env node
/* voc.js (C) 2012-present SheetJS -- http://sheetjs.com */
/* eslint-env node */

var myfile = process.argv[2]; if(!myfile || myfile ==='-') myfile='/dev/stdin';
var data = require('fs').readFileSync(myfile,'utf8');
var d = require('./voc').run(data);
var fs = require('fs');
if(fs.existsSync('.vocrc')) {
  var vocrc = JSON.parse(fs.readFileSync('.vocrc','utf8'));
  if(vocrc.output) fs.writeFileSync(vocrc.output, d);
  if(vocrc.post) {
    var exec = require('child_process').exec;
    exec(vocrc.post);
  }
}
else console.log(d);
