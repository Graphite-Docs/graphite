Parse and generate JSON text sequences as defined in [RFC 7464](https://tools.ietf.org/html/rfc7464).

JSON text sequences are nice for unambiguous JSON log files.  They are resilient
to many forms of damage such as truncation, multiple writers incorrectly
configured to write to the same file, corrupted JSON, etc.  An example sequence:

    ␞{"d":"2014-09-22T21:58:35.270Z","value":6}␤
    ␞{"d":"2014-09-22T21:59:15.117Z","value":12}␤

Where "␞" is the ASCII "Record Separator" character (U+001E), and "␤" is the
ASCII "LINE FEED" character (U+000A), otherwise known as "\n".

To install:

    npm install json-text-sequence

To parse the format, pipe an input source into a parser stream:

    var parser = require('json-text-sequence').parser;
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

To generate the format, create a generator, pipe its output somewhere
interesting, then write objects to the generator:

    var generator = require('json-text-sequence').generator;
    var fs = require('fs');

    var g = new generator();
    g.pipe(fs.createWriteStream('example.log'));

    g.write({
      d: new Date(),
      count: 0
    });

[![Build Status](https://travis-ci.org/hildjj/json-text-sequence.svg?branch=master)](https://travis-ci.org/hildjj/json-text-sequence)
[![Coverage Status](https://coveralls.io/repos/hildjj/json-text-sequence/badge.png?branch=master)](https://coveralls.io/r/hildjj/json-text-sequence?branch=master)
