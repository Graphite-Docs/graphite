#!/usr/bin/env node

'use strict';

var lzjs = require('../lzjs');
var path = require('path');
var fs = require('fs');

var argv = process.argv.slice(2);
var command, filename;

switch (argv.length) {
  case 0:
    command = '-h';
    break;
  case 1:
    command = argv[0];
    filename = argv[1];
    break;
  default:
    command = argv[0];
    filename = argv[1];
    break;
}

switch (command) {
  case '-v':
  case '--version':
    console.log('lzjs', require('../package.json').version);
    process.exit(0);
    break;
  case '-a':
  case '--add':
    compress(filename);
    process.exit(0);
    break;
  case '-x':
  case '--extract':
    decompress(filename);
    process.exit(0);
    break;
  case '-h':
  case '--help':
  default:
    help();
    process.exit(0);
    break;
}


function compress(filename) {
  if (filename == null || filename.length === 0) {
    throw new Error('Missing argument <file_name>.');
  }

  var basename = path.basename(filename);
  if (basename == null || basename.length === 0) {
    throw new Error('Empty filename.');
  }

  if (fs.statSync(filename).isDirectory()) {
    throw new Error('Cannot add to archive a directory.');
  }

  var outputName = path.resolve(
    path.dirname(filename) + path.sep + basename + '.lzjs'
  );

  var data = fs.readFileSync(filename);
  var compressed = lzjs.compress(data);
  fs.writeFileSync(outputName, compressed);
}


function decompress(filename) {
  if (filename == null || filename.length === 0) {
    throw new Error('Missing argument <file_name>.');
  }

  var basename = path.basename(filename);
  if (basename == null || basename.length === 0) {
    throw new Error('Empty filename');
  }

  if (fs.statSync(filename).isDirectory()) {
    throw new Error('Cannot extract a directory.');
  }

  var outputName = path.resolve(
    path.dirname(filename) + path.sep + path.basename(filename, '.lzjs')
  );

  var data = fs.readFileSync(filename);
  var decompressed = lzjs.decompress(data);
  fs.writeFileSync(outputName, decompressed);
}


function help() {
  console.log('Usage: lzjs <command> [file_name]');
  console.log('');
  console.log('Commands:');
  console.log('  -h, --help                 show Help');
  console.log('  -v, --version              show Version');
  console.log('  -a, --add <file_name>      Add file to archive');
  console.log('  -x, --extract <file_name>  eXtract file');
}
