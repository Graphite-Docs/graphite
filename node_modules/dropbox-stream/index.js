'use strict';
const upload = require('./upload');
const download = require('./download');

module.exports = {
  DropboxUploadStream: upload.DropboxUploadStream,
  createDropboxUploadStream: upload.createDropboxUploadStream,
  DropboxDownloadStream: download.DropboxDownloadStream,
  createDropboxDownloadStream: download.createDropboxDownloadStream
}
