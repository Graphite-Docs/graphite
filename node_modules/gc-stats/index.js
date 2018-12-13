"use strict";

var gcEmitter,
  binary = require('node-pre-gyp'),
  path = require('path'),
  binding_path = binary.find(path.resolve(path.join(__dirname,'./package.json'))),
  gcstats = require(binding_path),
  EventEmitter = require('events').EventEmitter;

function gcStats() {
  if (this instanceof gcStats){
    throw Error('gc-stats no longer exports a constructor. Call without the `new` keyword');
  }

  if(!gcEmitter) {
    gcEmitter = new EventEmitter();
    gcstats.afterGC(function(stats) {
      gcEmitter.emit('data', stats);
      gcEmitter.emit('stats', stats);
    });
  }

  return gcEmitter;
}

module.exports = gcStats;
