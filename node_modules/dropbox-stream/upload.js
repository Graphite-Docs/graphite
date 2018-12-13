'use strict';
const inherits = require('util').inherits;
const Transform = require('stream').Transform;
const api = require('./api');

const DropboxUploadStream = function(opts = {}) {
  Transform.call(this, opts);
  this.chunkSize = opts.chunkSize || 1000 * 1024;
  this.filepath = opts.filepath;
  this.token = opts.token;
  this.autorename = opts.autorename || true;
  this.session = undefined;
  this.offset = 0;
}
inherits(DropboxUploadStream, Transform);

DropboxUploadStream.prototype.checkBuffer = function(chunk) {
  if (!this.buffer) {
    this.buffer = Buffer.from(chunk);
  } else {
    this.buffer = Buffer.concat([ this.buffer, chunk ]);
  }

  return this.buffer.length >= this.chunkSize;
};

DropboxUploadStream.prototype.progress = function() {
  this.offset += this.buffer ? this.buffer.length : 0;
  this.emit('progress', this.offset);
  this.buffer = undefined;
};

DropboxUploadStream.prototype._transform = function(chunk, encoding, cb) {
  if (!this.checkBuffer(chunk)) {
    return cb();
  }

  if (!this.session) {
    this.uploadStart(cb);
  } else {
    this.uploadAppend(cb);
  }
};

DropboxUploadStream.prototype._flush = function(cb) {
  if (this.session) {
    this.uploadFinish(cb);
  } else {
    this.upload(cb);
  }
};

DropboxUploadStream.prototype.upload = function(cb) {
  api({
    call: 'upload',
    token: this.token,
    data: this.buffer,
    args: {
      path: this.filepath,
      autorename: this.autorename
    }
  }, (err, res) => {
    if (err) {
      this.buffer = undefined;
      return cb(err);
    }

    this.progress();
    this.emit('metadata', res);
    process.nextTick(() => cb());
  });
};

DropboxUploadStream.prototype.uploadStart = function(cb) {
  api({
    call: 'uploadStart',
    token: this.token,
    data: this.buffer
  }, (err, res) => {
    if (err) {
      this.buffer = undefined;
      return cb(err);
    }

    this.session = res.session_id;
    this.progress();
    cb();
  });
};

DropboxUploadStream.prototype.uploadAppend = function(cb) {
  api({
    call: 'uploadAppend',
    token: this.token,
    data: this.buffer,
    args: {
      cursor: {
        session_id: this.session,
        offset: this.offset
      }
    }
  }, err => {
    if (err) {
      this.buffer = undefined;
      return cb(err);
    }

    this.progress();
    cb();
  });
};

DropboxUploadStream.prototype.uploadFinish = function(cb) {
  api({
    call: 'uploadFinish',
    token: this.token,
    data: this.buffer,
    args: {
      cursor: {
        session_id: this.session,
        offset: this.offset
      },
      commit: {
        path: this.filepath,
        autorename: this.autorename
      }
    }
  }, (err, res) => {
    if (err) {
      this.buffer = undefined;
      return cb(err);
    }

    this.progress();
    this.emit('metadata', res);
    process.nextTick(() => cb());
  });
};

module.exports = {
  DropboxUploadStream,
  createDropboxUploadStream: opts => new DropboxUploadStream(opts)
};
