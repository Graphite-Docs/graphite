FileReader
==========

HTML5 FileAPI `FileReader` for Node.JS
(could potentially be modified to work with older browsers as well).

See <https://github.com/node-file-api/file-api> and <https://developer.mozilla.org/en-US/docs/Web/API/FileReader> 


```javascript
'use strict';

var FileReader = require('filereader')
  , fileReader = new FileReader()
  ;

fileReader.setNodeChunkedEncoding(true || false);
fileReader.readAsDataURL(new File('./files/my-file.txt'));

// non-standard alias of `addEventListener` listening to non-standard `data` event
fileReader.on('data', function (data) {
  console.log("chunkSize:", data.length);
});

// `onload` as listener
fileReader.addEventListener('load', function (ev) {
  console.log("dataUrlSize:", ev.target.result.length);
});

// `onloadend` as property
fileReader.onloadend', function () {
  console.log("Success");
});
```
```

Implemented API

  * `.readAsArrayBuffer(<File>)`
  * `.readAsBinaryString(<File>)`
  * `.readAsDataURL(<File>)`
  * `.readAsText(<File>)`
  * `.addEventListener(eventname, callback)`
  * `.removeEventListener(callback)`
  * `.dispatchEvent(eventname)`
  * `.EMPTY = 0`
  * `.LOADING = 1`
  * `.DONE = 2`
  * `.error = undefined`
  * `.readyState = self.EMPTY`
  * `.result = undefined`

Events

  * start
  * progress
  * error
  * load
  * end
  * abort
  * data // non-standard

Event Payload

`end`
```javascript
{ target:
  { nodeBufferResult: <Buffer> // non-standard
  , result: <Buffer|Binary|Text|DataURL>
  }
}
```

`progress`
```javascript
// fs.stat will probably complete before this
// but possibly it will not, hence the check
{ lengthComputable: (!isNaN(file.size)) ? true : false
, loaded: buffers.dataLength
, total: file.size
}
```

Non-W3C API

  * `.on(eventname, callback)`
  * `.nodeChunkedEncoding = false`
  * `.setNodeChunkedEncoding(<Boolean>)`
  
Misc Notes on FileReader
===

**FileReader.setNodeChunkedEncoding()** is a *non-standard* method which hints that the `FileReader` should chunk if possible

I.E. The file will be sent with the header `Transfer-Encoding: chunked`

The default is `false` since many webservers do not correctly implement the standard correctly,
and hence do not expect or accept `Transfer-Encoding: chunked` from clients.

**FileReader.on** is a *non-standard* alias of `addEventListener`

**EventTarget.target.nodeBufferResult** is a *non-standard* property which is a `Node.Buffer` instance of the data.

**FileReader.on('data', fn)** is a *non-standard* event which passes a `Node.Buffer` chunk each time the `progress` event is fired.
