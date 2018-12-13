/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
//
// FormData
//
// http://hacks.mozilla.org/2010/05/formdata-interface-coming-to-firefox/
//
(function () {
  "use strict";

  require('remedial');
  require('bufferjs');

  var EventEmitter = require('events').EventEmitter
    , forEachAsync = require('foreachasync').forEachAsync
    , File = require('File')
    , FileReader = require('filereader')
    ;

  function isFile(o) {
    return (o instanceof File) ||
      (o.name && (o.path || o.stream || o.buffer));
  }

  function FormData() {
    var self = this
      , first = true
      , fields = {}
      ;

    self.nodeChunkedEncoding = false;

    self.setNodeChunkedEncoding = function (val) {
      self.nodeChunkedEncoding = val;
    };

    self.getContentType = function () {
      return self.type;
    };

    self.append = function (key, val) {
      var field = fields[key] = fields[key] || [],
        err;
      
      if (field.length > 0 && '[]' !== key.substr(key.length - 2)) {
        err = new Error("Overwriting '" + key + "'. Use '" + key  + "[] if you intend this to be treated as an array' ");
        console.log(err.message);
        field.pop();
      }

      field.push(val);
      return err;
    };

    function toJSON() {
      /*
        files.forEach(function (file) {
          var fr = new FileReader();
          fr.addEventListener('load', join.deliverer());
          fr.readAsText('base64');
        });
      */
    }

    function toContentDisposition(key, val) {
      var emitter = new EventEmitter(),
        text = '',
        fr;

      if (first) {
        first = false;
      } else {
        text += '\r\n';
      }
      text += '--' + self.boundary;
      text += "\r\nContent-Disposition: form-data; name=" + key.quote();

      if (!isFile(val)) {
        if ('string' !== typeof val) {
          val = JSON.stringify(val);
        }
        process.nextTick(function () {
          emitter.emit('data', new Buffer(text + "\r\n\r\n" + val));
          emitter.emit('end');
        });
      } else {
        fr = new FileReader();
        fr.on('loadstart', function () {
          text += '; filename="' + val.name + '"';
          text += "\r\nContent-Type: " + (val.type || 'application/binary') + "\r\n\r\n";
          emitter.emit('data', new Buffer(text));
        });
        fr.on('data', function (data) {
          emitter.emit('data', data);
        });
        fr.on('loadend', function () {
          emitter.emit('end');
        });
        fr.setNodeChunkedEncoding(self.nodeChunkedEncoding);
        fr.readAsArrayBuffer(val);
      }
      return emitter;
    }

    function toFormData() {
      var emitter = new EventEmitter(),
        buffers = [];

      emitter.on('data', function (data) {
        buffers.push(data);
      });

      forEachAsync(Object.keys(fields), function (next, key) {
        forEachAsync(fields[key], function (next2, item) {
          var stream = toContentDisposition(key, item);
          stream.on('data', function (data) {
            emitter.emit('data', data);
          });
          stream.on('end', next2);
        })
        .then(next);
      })
      .then(function () {
        var footer = new Buffer("\r\n--" + self.boundary + "--\r\n");
        emitter.emit('data', footer);
        emitter.emit('ready');
      });

      emitter.on('ready', function () {
        var data = Buffer.concat(buffers);
        // TODO
        // determine the size as quickly as possible
        // so that the data can still be streamed, even
        // if the content-length must be known
        //
        // This will only take a significant amount of time
        // if one of the `File`s is stream-backed. Waiting
        // for the stream's `end` will hold-up the content-length
        // calculation.
        emitter.emit('size', data.length);
        emitter.emit('load', data);
        emitter.emit('end');
      });

      return emitter;
    }

    function toFormUrlEncoded() {
    }

    function randomString(len, charset) {
      var numbers = "0123456789",
        ualpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lalpha = "abcdefghijklmnopqrstuvwxyz",
        special = "+/-_:",
        radix = {
          base16: numbers + ualpha.substr(0, 6),
          base36: numbers + ualpha,
          base64: ualpha + lalpha + numbers + special.substr(0,2),
          base64url: ualpha + lalpha + numbers + special.substr(2,2),
          base64xml: ualpha + lalpha + numbers + special.substr(3,2)
        },
        result = '',
        chars,
        length,
        seed,
        i;

      length = len || 8;
      chars = radix[charset] || charset || radix.base64url;

      for (i = 0; i < length; i +=1) {
        seed = Math.floor(Math.random() * chars.length);
        result += chars.substring(seed, seed + 1);
      }

      return result;
    }


    self.serialize = function (intendedType) {
      self.type = intendedType = (intendedType || '').toLowerCase();

      if ('multipart/form-data' !== self.type) {
        Object.keys(fields).forEach(function (key) {
          // TODO traverse entire tree
          fields[key].forEach(function (item) {
            if (isFile(item)) {
              self.type = 'multipart/form-data';
            }
          });
        });

        if ('multipart/form-data' === self.type) {
          console.log("ContentType changed `multipart/form-data`: Some of the upload items are `HTML5::FileAPI::File`s.");
        }


        // This is how FireFox does it. Seems good enough to me.
        // Note that the spec also allows a space in the middle, but not at the end
        // http://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
        //self.boundary = "---------------------------5414130496409022042012852923";
        self.boundary = '---------------------------' + randomString(28, 'base64url', "'()+_,-./:=?");
        self.type += '; boundary=' + self.boundary;

        return toFormData();
      }

      if (!self.type || 'application/x-www-form-urlencoded' === self.type.toLowerCase()) {
        self.type = 'application/x-www-form-urlencoded';
        return toFormUrlEncoded();
      }

      if ('application/json' === self.type.toLowerCase()) {
        return toJSON();
      }
    };
  }

  module.exports = FormData;
}());
