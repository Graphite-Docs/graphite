'use strict';

var lzjs = require('../lzjs');

var assert = require('assert');
var fs = require('fs');

describe('lzjs test', function() {

  var tests = {};

  before(function(done) {
    var i;

    tests.unicode = '';
    for (i = 0; i <= 0xffff; i++) {
      tests.unicode += String.fromCharCode(i);
    }

    tests.unicodeReverse = '';
    for (i = 0xffff; i >= 0; --i) {
      tests.unicodeReverse += String.fromCharCode(i);
    }

    tests.randoms = [];
    var s, code;
    for (var j = 0; j < 3; j++) {
      s = '';
      for (i = 0; i <= 0xffff; i++) {
        code = ~~(Math.random() * (0xffff + 1));
        s += String.fromCharCode(code);
      }
      tests.randoms.push(s);
    }

    tests.bits = [];
    var max = 60 * (60 + 1);
    var bits = [59, 60, 61, max - 1, max, max + 1];
    for (i = 0; i < bits.length; i++) {
      tests.bits.push(new Array(bits[i] + 1).join('a'));
    }

    tests.unicodeBits = [];
    for (i = 0; i < bits.length; i++) {
      tests.unicodeBits.push(new Array(bits[i] + 1).join('a\u3042'));
      tests.unicodeBits.push(new Array(bits[i] + 1).join('\u3042'));
      tests.unicodeBits.push(new Array(bits[i] + 1).join('\u3042a'));
    }

    tests.chars = [];
    for (i = 0; i <= 0xffff; i += 32) {
      tests.chars.push(new Array(100).join(String.fromCharCode(i)));
    }

    tests.hello = 'Hello World.';
    tests.code = fs.readFileSync(__filename);
    done();
  });

  describe('compress/decompress', function() {
    it('ascii string', function() {
      assert(tests.hello.length > 0);
      var compressed = lzjs.compress(tests.hello);
      assert(compressed.length > 0);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, tests.hello);
    });

    it('ascii string*5', function() {
      var s = new Array(6).join(tests.hello);
      assert(s.length > 0);
      var compressed = lzjs.compress(s);
      assert(compressed.length > 0);
      assert(s.length > compressed.length);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, s);
    });

    it('unicode [U+0000 - U+FFFF]', function() {
      assert(tests.unicode.length > 0);
      var compressed = lzjs.compress(tests.unicode);
      assert(compressed.length > 0);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, tests.unicode);
    });

    it('unicode [U+0000 - U+FFFF]*2', function() {
      var s = tests.unicode + tests.unicode;
      assert(s.length > 0);
      var compressed = lzjs.compress(s);
      assert(compressed.length > 0);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, s);
      tests.unicode = null;
    });

    it('unicode [U+0000 - U+FFFF] reverse', function() {
      assert(tests.unicodeReverse.length > 0);
      var compressed = lzjs.compress(tests.unicodeReverse);
      assert(compressed.length > 0);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, tests.unicodeReverse);
    });

    it('unicode chars', function() {
      tests.chars.forEach(function(c) {
        assert(c.length > 0);
        var compressed = lzjs.compress(c);
        assert(compressed.length > 0);
        var decompressed = lzjs.decompress(compressed);
        assert.equal(decompressed, c);
      });
      tests.chars = null;
    });

    it('random chars', function() {
      var randomString = tests.randoms[0];
      assert(randomString.length > 0);
      var compressed = lzjs.compress(randomString);
      assert(compressed.length > 0);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, randomString);
    });

    it('random chars 2', function() {
      var randomString = tests.randoms[1];
      assert(randomString.length > 0);
      var compressed = lzjs.compress(randomString);
      assert(compressed.length > 0);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, randomString);
    });

    it('random chars 3', function() {
      var randomString = tests.randoms[2];
      assert(randomString.length > 0);
      var compressed = lzjs.compress(randomString);
      assert(compressed.length > 0);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, randomString);
    });

    it('bits', function() {
      tests.bits.forEach(function(c) {
        assert(c.length > 0);
        var compressed = lzjs.compress(c);
        assert(compressed.length > 0);
        var decompressed = lzjs.decompress(compressed);
        assert.equal(decompressed, c);
      });
      tests.bits = null;
    });

    it('unicode bits', function() {
      tests.unicodeBits.forEach(function(c) {
        assert(c.length > 0);
        var compressed = lzjs.compress(c);
        assert(compressed.length > 0);
        var decompressed = lzjs.decompress(compressed);
        assert.equal(decompressed, c);
      });
      tests.unicodeBits = null;
    });

    it('this source code', function() {
      var s = new Array(5).join(tests.code.toString());
      assert(s.length > 0);
      var compressed = lzjs.compress(s);
      assert(compressed.length > 0);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, s);
    });

    it('this source code (Buffer)', function() {
      var buffer = tests.code;
      assert(buffer.length > 0);
      var compressed = lzjs.compress(buffer);
      assert(compressed.length > 0);
      var decompressed = lzjs.decompress(compressed);
      assert.equal(decompressed, buffer.toString());
    });
  });
});
