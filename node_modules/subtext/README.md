# subtext

HTTP payload parser.

[![Build Status](https://secure.travis-ci.org/hapijs/subtext.svg?branch=master)](http://travis-ci.org/hapijs/subtext)

Lead Maintainer: [John Brett](https://github.com/johnbrett)

subtext parses the request body and exposes it in a callback.

## Example

```javascript
const Http = require('http');
const Subtext = require('subtext');

Http.createServer((request, response) => {

    Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Payload contains: ' + parsed.payload.toString());
    });

}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');

```

## API

See the [API Reference](API.md)


### Warning for subtext on Node below v4.3.2

A Node bug in versions below Node v4.3.2 meant that the `Buffer.byteLength` function did not work correctly, and as such, using `maxBytes` options with multipart payloads will mistake the file buffer size to be incorrectly as bigger than it is. Your options here are either to upgrade to Node version greater than v4.3.2 or increase maxBytes to allow some error in calculation. [Background info in this issue here](https://github.com/hapijs/subtext/pull/32).
