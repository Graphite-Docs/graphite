# dropbox-fs [![Build Status](https://travis-ci.org/sallar/dropbox-fs.svg?branch=master)](https://travis-ci.org/sallar/dropbox-fs) [![codecov](https://codecov.io/gh/sallar/dropbox-fs/branch/master/graph/badge.svg)](https://codecov.io/gh/sallar/dropbox-fs)

Node [`fs`](https://nodejs.org/api/fs.html) wrapper for Dropbox. Wraps the [Dropbox](http://npmjs.com/package/dropbox) javascript module with an async `fs`-like API so it can be used where a fileSystem API is expected.


## Installation

To use this module you'll need a [Dropbox Access Token](https://blogs.dropbox.com/developers/2014/05/generate-an-access-token-for-your-own-account/).

``` bash
$ npm install --save dropbox-fs
```

## Usage

``` js
const dfs = require('dropbox-fs')({
    apiKey: 'DROPBOX_API_KEY_HERE'
});

dfs.readdir('/Public', (err, result) => {
    console.log(result); // Array of files and folders
});
```

You can also pass in a `client` option if you’re using your own `dropbox` module instead of the `apiKey`.

If you'd like some peace of mind then there's a read-only option too:

``` js
const dfs = require('dropbox-fs/readonly')({
    apiKey: 'DROPBOX_API_KEY_HERE'
});

// Methods that might change data now return an error without performing any action:
// - mkdir
// - rename
// - rmdir
// - unlink
// - writeFile

dfs.unlink('/Public', (err) => {
    console.log(err); // Message saying `unlink` is not supported in read-only
});
```

## API

This module exposes the following methods:

### readdir(path[, options], callback)

Reads a directory and returns a list of files and folders inside.

``` js
dfs.readdir('/', (err, result) => {
    console.log(result);
});
```

- `path`: `String|Buffer`
- `callback`: `Function`

### mkdir(path, callback)

Creates a directory.

``` js
dfs.mkdir('/Public/Resume', (err, stat) => {
    console.log(stat.name); // Resume
    console.log(stat.isDirectory()); // true
});
```

- `path`: `String|Buffer`
- `callback`: `Function`

### rmdir(path, callback)

Deletes a directory.

``` js
dfs.rmdir('/Public/Resume', err => {
    if (!err) {
        console.log('Deleted.');
    }
});
```

- `path`: `String|Buffer`
- `callback`: `Function`

### readFile(path[, options], callback)

Reads a file and returns it’s contents.

``` js
// Buffer:
dfs.readFile('/Work/doc.txt', (err, result) => {
    console.log(result.toString('utf8'));
});

// String
dfs.readFile('/Work/doc.txt', {encoding: 'utf8'}, (err, result) => {
    console.log(result);
});
```

- `path`: `String|Buffer`
- `options`: Optional `String|Object`
    - `encoding`: `String`
- `callback`: `Function`

If you pass a string as the `options` parameter, it will be used as `options.encoding`. If you don’t provide an encoding, a raw `Buffer` will be passed to the callback.

### writeFile(path, data[, options], callback)

Writes a file to the remote API and returns it’s `stat`.

``` js
const content = fs.readFileSync('./localfile.md');
dfs.writeFile('/Public/doc.md', content, {encoding: 'utf8'}, (err, stat) => {
    console.log(stat.name); // doc.md
});
```

- `path`: `String|Buffer`
- `data`: `String|Buffer`
- `options`: Optional `String|Object`
    - `encoding`: `String`
    - `overwrite`: `Boolean` Default: `true`.
- `callback`: `Function`

### rename(fromPath, toPath, callback)

Renames a file (moves it to a new location).

``` js
dfs.rename('/Public/doc.md', '/Backups/doc-backup.md', err => {
    if err {
        console.error('Failed!');
    } else {
        console.log('Moved!');
    }
});
```

- `path`: `String|Buffer`
- `data`: `String|Buffer`
- `callback`: `Function`

### stat(path, callback)

Returns the file/folder information.

``` js
dfs.stat('/Some/Remote/Folder/', (err, stat) => {
    console.log(stat.isDirectory()); // true
    console.log(stat.name); // Folder
});
```

- `path`: `String|Buffer`
- `callback`: `Function`
    - `err`: `null|Error`
    - `stat`: [Stat](#stat-object) Object

### unlink(path, callback)

Deletes a file.

``` js
dfs.unlink('/Path/To/file.txt', err => {
    if (!err) {
        console.log('Deleted!');
    }
});
```

- `path`: `String|Buffer`
- `callback`: `Function`

## createReadStream(path)

Creates a readable stream.

``` js
const stream = fs.createReadStream('/test/test1.txt');
stream.on('data', data => {
    console.log('data', data);
});
stream.on('end', () => {
    console.log('stream finished');
});
```

## createWriteStream(path)

Creates a writable stream.

``` js
const stream = fs.createWriteStream('/test/test1.txt');

someStream().pipe(stream).on('finish', () => {
    console.log('write stream finished');
});
```

## Stat Object

The stat object that is returned from `writeFile()` and `stat()` contains two methods in addition to some standard information like `name`, etc:

- `stat.isDirectory()` Returns `true` if the target is a directory
- `stat.isFile()` Returns `true` if the target is a file

## License

This software is released under the [MIT License](https://sallar.mit-license.org/).
