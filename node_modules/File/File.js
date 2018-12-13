//
// File
//
// http://www.w3.org/TR/FileAPI/#dfn-file
// https://developer.mozilla.org/en/DOM/File
(function () {
  "use strict";

  var fs = require("fs"),
    path = require("path"),
    mime = require("mime");

  // string
  // stream
  // buffer
  function File(input) {
    var self = this;

    function updateStat(stat) {
      self.stat = stat;
      self.lastModifiedDate = self.stat.mtime;
      self.size = self.stat.size;
    }

    if ('string' === typeof input) {
      self.path = input;
    } else {
      Object.keys(input).forEach(function (k) {
        self[k] = input[k];
      });
    }

    self.name = self.name || path.basename(self.path||'');
    if (!self.name) {
      throw new Error("No name");
    }
    self.type = self.type || mime.lookup(self.name);

    if (!self.path) {
      if (self.buffer) {
        self.size = self.buffer.length;
      } else if (!self.stream) {
        throw new Error('No input, nor stream, nor buffer.');
      }
      return;
    }

    if (!self.jsdom) {
      return;
    }

    if (!self.async) {
      updateStat(fs.statSync(self.path));
    } else {
      fs.stat(self.path, function (err, stat) {
        updateStat(stat);
      });
    }
  }

  module.exports = File;
}());
