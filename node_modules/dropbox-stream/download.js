'use strict';
const inherits = require('util').inherits;
const Transform = require('stream').Transform;
const api = require('./api');

const DropboxDownloadStream = function(opts) {
  Transform.call(this, opts);
  this.getStream(opts.token, opts.filepath);
  this.offset = 0;
}
inherits(DropboxDownloadStream, Transform);

DropboxDownloadStream.prototype.getStream = function(token, filepath) {
  const req = api({
    call: 'download',
    token: token,
    args: {
      path: filepath
    }
  }, (err, res) => {
    if (err) {
      process.nextTick(() => this.emit('error', err));
      return;
    }

    this.emit('metadata', res);
  });

  req.pipe(this);
};

DropboxDownloadStream.prototype._transform = function(chunk, encoding, cb) {
  this.offset += chunk.length;
  this.emit('progress', this.offset);
  cb(null, chunk);
}

module.exports = {
  DropboxDownloadStream,
  createDropboxDownloadStream: opts => new DropboxDownloadStream(opts)
}
