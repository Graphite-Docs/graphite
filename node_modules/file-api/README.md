file-api
========

HTML5 FileAPI implemented in Node.js

The goal here is to be able to use this in connection with `jsdom` to create test utilities,
possibly scraping utilities, ultimately an API-driven browser written in Node.

Usage
====

Install:

```bash
npm install file-api
```

Use:

```javascript
var FileAPI = require('file-api')
  , File = FileAPI.File
  , FileList = FileAPI.FileList
  , FileReader = FileAPI.FileReader
  ;
```

API
====

Since `HTML5 FileAPI` has been described by the W3C (terse, technical) and Mozilla Developer Center (understandable, end-user-oriented) in detail, I'll just highlight the differences:

  * `File` is not (yet) a subclass of `Blob`
  * `FileError` and `FileException` are not yet implemented (they use `Error` instead)
  * `blob: scheme` and remote `URI schemes` are not yet implemented

FormData
----

[FormData on MDN](https://developer.mozilla.org/en/XMLHttpRequest/FormData)

Has the special method `setNodeChunkedEncoding()`

File
----

In the browser, `File` has no constructor. In Node, it does.

`node-mime` is used for extension-based automatic `ContentType` detection (uses `name` if available, or `path` if not)

**File(StringUriPath)**

    var file = new File("./files/myfile.txt");

**File({ buffer: Node.Buffer })**

    var file = new File({ 
      name: "abc-song.txt",   // required
      type: "text/plain",     // optional
      buffer: new Buffer("abcdefg,hijklmnop, qrs, tuv, double-u, x, y and z")
    });

**File({ stream: Node.ReadStream })**

    var file = new File({
      name: "abc-song.txt",       // required
      type: "text/plain",         // optional
      stream: new EventEmitter()  // a read stream (emits `error`, `data`, `end`)
    });

    process.nextTick(function () {
      file.stream.emit('data', "abcdefg,hijklmnop, qrs, tuv, double-u, x, y and z");
      file.stream.emit('end');
    });

**File(Object)**

    var file = new File({
      path: "./files/myfile.txt",   // path of file to read


      buffer: Node.Buffer,          // use this Buffer instead of reading file


      stream: Node.ReadStream,      // use this ReadStream instead of reading file


      name: "SomeAwesomeFile.txt",  // optional when using `path`
                                    // must be supplied when using `Node.Buffer` or `Node.ReadStream`


      type: "text/plain",           // generated based on the extension of `name` or `path`


      jsdom: true,                  // be DoM-like and immediately get `size` and `lastModifiedDate`
                                    // [default: false]


      async: true,                  // use `fs.stat` instead of `fs.statSync` for getting 
                                    // the `jsdom` info
                                    // [default: false]


      lastModifiedDate: fileStat.mtime.toISOString(),


      size: fileStat.size || Buffer.length
    );


FileReader
----

**FileReader.setNodeChunkedEncoding()** is a *non-standard* method which hints that the `FileReader` should chunk if possible

I.E. The file will be sent with the header `Transfer-Encoding: chunked`

The default is `false` since many webservers do not correctly implement the standard correctly,
and hence do not expect or accept `Transfer-Encoding: chunked` from clients.

**FileReader.on** is a *non-standard* alias of `addEventListener`

**EventTarget.target.nodeBufferResult** is a *non-standard* property which is a `Node.Buffer` instance of the data.

**FileReader.on('data', fn)** is a *non-standard* event which passes a `Node.Buffer` chunk each time the `progress` event is fired.

    var fileReader = new FileReader();

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

FileList
----

The browser has no constructor for this. Node has two.

**new FileList(f1, f2, ...)**

    var fileList = new FileList(file1, file2, file3);

**new FileList([f1, f2])**

    var files = [
        new File('./files/blob.bin'),
        new File('./files/image.jpg'),
        new File('./files/readme.txt')
      ],
      fileList;

    fileList = new FileList(files);

Formal Documentation
====

W3C

  * [W3C: FileAPI](http://dev.w3.org/2006/webapi/FileAPI)
  * [W3C: Blob](http://dev.w3.org/2006/webapi/FileAPI/#dfn-Blob)
  * [W3C: File](http://dev.w3.org/2006/webapi/FileAPI/#dfn-file)
  * [W3C: FileList](http://dev.w3.org/2006/webapi/FileAPI/#dfn-filelist)
  * [W3C: FileReader](http://dev.w3.org/2006/webapi/FileAPI/#dfn-filereader)
  * [W3C: FileError](http://dev.w3.org/2006/webapi/FileAPI/#dfn-fileerror)
  * [W3C: URI scheme](http://dev.w3.org/2006/webapi/FileAPI/#url)

Mozilla Developer Center:

  * [MDN: Using files from web applications](https://developer.mozilla.org/en/using_files_from_web_applications)
  * [MDN: File](https://developer.mozilla.org/en/DOM/File)
  * [MDN: FileList](https://developer.mozilla.org/en/DOM/FileList)
  * [MDN: FileReader](https://developer.mozilla.org/en/DOM/FileReader)

TODO
====

    //
    // TODO
    //
    // HTML5 File URI should be implemented
    //   will need non-ahr 301-handling requester not prevent circular dep
    //
    // File should be a subclass of Blob
    //
    // jsdom EventTarget // http://aptana.com/reference/html/api/EventTarget.html
    //    target.result
    // 
    // jsdom ProgressEvent // http://www.w3.org/TR/progress-events/
    //    lengthComputable
    //    loaded
    //    total
    //    initProgressEvent
