#!/usr/bin/env node

var pj = require('../index')
var filename = process.argv[2]

function convert(str) {
  if (str[0] === '{') {
    console.log(pj.jwk2pem(JSON.parse(str)))
  }
  else {
    console.log(JSON.stringify(pj.pem2jwk(str)))
  }
}

if (!filename) {
  var chunks = []
  process.stdin.on('readable', function() {
    var chunk = process.stdin.read()
    if (chunk !== null) {
      chunks.push(chunk)
    }
  })
  process.stdin.on('end', function () {
    convert(Buffer.concat(chunks).toString('utf8'))
  })
}
else {
  var path = require('path')
  var fs = require('fs')
  var filepath = path.resolve(process.cwd(), filename)
  try {
    convert(fs.readFileSync(filepath, 'utf8'))
  }
  catch (e) {
    console.error('Could not read file: %s', filepath)
    process.exit(1)
  }
}

