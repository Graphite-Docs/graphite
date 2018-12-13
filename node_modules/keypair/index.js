var forge = {};
var aes = forge.aes = {};
var md = forge.md = {};
var pki = forge.pki = {};
var rsa = forge.pki.rsa = forge.rsa = {};
var util = forge.util = {};

/**
 * Expose `keypair`.
 */

module.exports = function (opts) {
  if (!opts) opts = {};
  if (typeof opts.bits == 'undefined') opts.bits = 2048;
  var keypair = forge.rsa.generateKeyPair(opts);
  keypair = {
    public: fix(forge.pki.publicKeyToRSAPublicKeyPem(keypair.publicKey, 72)),
    private: fix(forge.pki.privateKeyToPem(keypair.privateKey, 72))
  };
  return keypair;
};

function fix (str) {
  return str.replace(/\r/g, '') + '\n'
}

/**
 * util.fillString
 */

util.fillString = function(c, n) {
  var s = '';
  while(n > 0) {
    if(n & 1) {
      s += c;
    }
    n >>>= 1;
    if(n > 0) {
      c += c;
    }
  }
  return s;
};

/**
 * md.sha1
 */

var sha1 = forge.sha1 = forge.md.sha1 = {};

// sha-1 padding bytes not initialized yet
var _padding = null;
var _initialized = false;

/**
 * Initializes the constant tables.
 */
var _init = function() {
  // create padding
  _padding = String.fromCharCode(128);
  _padding += forge.util.fillString(String.fromCharCode(0x00), 64);

  // now initialized
  _initialized = true;
};

/**
 * Updates a SHA-1 state with the given byte buffer.
 *
 * @param s the SHA-1 state to update.
 * @param w the array to use to store words.
 * @param bytes the byte buffer to update with.
 */
var _update = function(s, w, bytes) {
  // consume 512 bit (64 byte) chunks
  var t, a, b, c, d, e, f, i;
  var len = bytes.length();
  while(len >= 64) {
    // the w array will be populated with sixteen 32-bit big-endian words
    // and then extended into 80 32-bit words according to SHA-1 algorithm
    // and for 32-79 using Max Locktyukhin's optimization

    // initialize hash value for this chunk
    a = s.h0;
    b = s.h1;
    c = s.h2;
    d = s.h3;
    e = s.h4;

    // round 1
    for(i = 0; i < 16; ++i) {
      t = bytes.getInt32();
      w[i] = t;
      f = d ^ (b & (c ^ d));
      t = ((a << 5) | (a >>> 27)) + f + e + 0x5A827999 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    for(; i < 20; ++i) {
      t = (w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]);
      t = (t << 1) | (t >>> 31);
      w[i] = t;
      f = d ^ (b & (c ^ d));
      t = ((a << 5) | (a >>> 27)) + f + e + 0x5A827999 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    // round 2
    for(; i < 32; ++i) {
      t = (w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]);
      t = (t << 1) | (t >>> 31);
      w[i] = t;
      f = b ^ c ^ d;
      t = ((a << 5) | (a >>> 27)) + f + e + 0x6ED9EBA1 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    for(; i < 40; ++i) {
      t = (w[i - 6] ^ w[i - 16] ^ w[i - 28] ^ w[i - 32]);
      t = (t << 2) | (t >>> 30);
      w[i] = t;
      f = b ^ c ^ d;
      t = ((a << 5) | (a >>> 27)) + f + e + 0x6ED9EBA1 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    // round 3
    for(; i < 60; ++i) {
      t = (w[i - 6] ^ w[i - 16] ^ w[i - 28] ^ w[i - 32]);
      t = (t << 2) | (t >>> 30);
      w[i] = t;
      f = (b & c) | (d & (b ^ c));
      t = ((a << 5) | (a >>> 27)) + f + e + 0x8F1BBCDC + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    // round 4
    for(; i < 80; ++i) {
      t = (w[i - 6] ^ w[i - 16] ^ w[i - 28] ^ w[i - 32]);
      t = (t << 2) | (t >>> 30);
      w[i] = t;
      f = b ^ c ^ d;
      t = ((a << 5) | (a >>> 27)) + f + e + 0xCA62C1D6 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }

    // update hash state
    s.h0 += a;
    s.h1 += b;
    s.h2 += c;
    s.h3 += d;
    s.h4 += e;

    len -= 64;
  }
};

/**
 * Creates a SHA-1 message digest object.
 *
 * @return a message digest object.
 */
sha1.create = function() {
  // do initialization as necessary
  if(!_initialized) {
    _init();
  }

  // SHA-1 state contains five 32-bit integers
  var _state = null;

  // input buffer
  var _input = forge.util.createBuffer();

  // used for word storage
  var _w = new Array(80);

  // message digest object
  var md = {
    algorithm: 'sha1',
    blockLength: 64,
    digestLength: 20,
    // length of message so far (does not including padding)
    messageLength: 0
  };

  /**
   * Starts the digest.
   */
  md.start = function() {
    md.messageLength = 0;
    _input = forge.util.createBuffer();
    _state = {
      h0: 0x67452301,
      h1: 0xEFCDAB89,
      h2: 0x98BADCFE,
      h3: 0x10325476,
      h4: 0xC3D2E1F0
    };
  };
  // start digest automatically for first time
  md.start();

  /**
   * Updates the digest with the given message input. The given input can
   * treated as raw input (no encoding will be applied) or an encoding of
   * 'utf8' maybe given to encode the input using UTF-8.
   *
   * @param msg the message input to update with.
   * @param encoding the encoding to use (default: 'raw', other: 'utf8').
   */
  md.update = function(msg, encoding) {
    if(encoding === 'utf8') {
      msg = forge.util.encodeUtf8(msg);
    }

    // update message length
    md.messageLength += msg.length;

    // add bytes to input buffer
    _input.putBytes(msg);

    // process bytes
    _update(_state, _w, _input);

    // compact input buffer every 2K or if empty
    if(_input.read > 2048 || _input.length() === 0) {
      _input.compact();
    }
  };

   /**
    * Produces the digest.
    *
    * @return a byte buffer containing the digest value.
    */
   md.digest = function() {
    /* Note: Here we copy the remaining bytes in the input buffer and
      add the appropriate SHA-1 padding. Then we do the final update
      on a copy of the state so that if the user wants to get
      intermediate digests they can do so. */

    /* Determine the number of bytes that must be added to the message
      to ensure its length is congruent to 448 mod 512. In other words,
      a 64-bit integer that gives the length of the message will be
      appended to the message and whatever the length of the message is
      plus 64 bits must be a multiple of 512. So the length of the
      message must be congruent to 448 mod 512 because 512 - 64 = 448.

      In order to fill up the message length it must be filled with
      padding that begins with 1 bit followed by all 0 bits. Padding
      must *always* be present, so if the message length is already
      congruent to 448 mod 512, then 512 padding bits must be added. */

    // 512 bits == 64 bytes, 448 bits == 56 bytes, 64 bits = 8 bytes
    // _padding starts with 1 byte with first bit is set in it which
    // is byte value 128, then there may be up to 63 other pad bytes
    var len = md.messageLength;
    var padBytes = forge.util.createBuffer();
    padBytes.putBytes(_input.bytes());
    padBytes.putBytes(_padding.substr(0, 64 - ((len + 8) % 64)));

    /* Now append length of the message. The length is appended in bits
      as a 64-bit number in big-endian order. Since we store the length
      in bytes, we must multiply it by 8 (or left shift by 3). So here
      store the high 3 bits in the low end of the first 32-bits of the
      64-bit number and the lower 5 bits in the high end of the second
      32-bits. */
    padBytes.putInt32((len >>> 29) & 0xFF);
    padBytes.putInt32((len << 3) & 0xFFFFFFFF);
    var s2 = {
      h0: _state.h0,
      h1: _state.h1,
      h2: _state.h2,
      h3: _state.h3,
      h4: _state.h4
    };
    _update(s2, _w, padBytes);
    var rval = forge.util.createBuffer();
    rval.putInt32(s2.h0);
    rval.putInt32(s2.h1);
    rval.putInt32(s2.h2);
    rval.putInt32(s2.h3);
    rval.putInt32(s2.h4);
    return rval;
  };

  return md;
};


/**
 * util.ByteBuffer
 */

/**
 * Constructor for a byte buffer.
 *
 * @param b the bytes to wrap (as a UTF-8 string) (optional).
 */
util.ByteBuffer = function(b) {
  // the data in this buffer
  this.data = b || '';
  // the pointer for reading from this buffer
  this.read = 0;
};

/**
 * Gets the number of bytes in this buffer.
 *
 * @return the number of bytes in this buffer.
 */
util.ByteBuffer.prototype.length = function() {
  return this.data.length - this.read;
};

/**
 * Gets whether or not this buffer is empty.
 *
 * @return true if this buffer is empty, false if not.
 */
util.ByteBuffer.prototype.isEmpty = function() {
  return (this.data.length - this.read) === 0;
};

/**
 * Puts a byte in this buffer.
 *
 * @param b the byte to put.
 */
util.ByteBuffer.prototype.putByte = function(b) {
  this.data += String.fromCharCode(b);
};

/**
 * Puts a byte in this buffer N times.
 *
 * @param b the byte to put.
 * @param n the number of bytes of value b to put.
 */
util.ByteBuffer.prototype.fillWithByte = function(b, n) {
  b = String.fromCharCode(b);
  var d = this.data;
  while(n > 0) {
    if(n & 1) {
      d += b;
    }
    n >>>= 1;
    if(n > 0) {
      b += b;
    }
  }
  this.data = d;
};

/**
 * Puts bytes in this buffer.
 *
 * @param bytes the bytes (as a UTF-8 encoded string) to put.
 */
util.ByteBuffer.prototype.putBytes = function(bytes) {
  this.data += bytes;
};

/**
 * Puts a UTF-16 encoded string into this buffer.
 *
 * @param str the string to put.
 */
util.ByteBuffer.prototype.putString = function(str) {
  this.data += util.encodeUtf8(str);
};

/**
 * Puts a 16-bit integer in this buffer in big-endian order.
 *
 * @param i the 16-bit integer.
 */
util.ByteBuffer.prototype.putInt16 = function(i) {
  this.data +=
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF);
};

/**
 * Puts a 24-bit integer in this buffer in big-endian order.
 *
 * @param i the 24-bit integer.
 */
util.ByteBuffer.prototype.putInt24 = function(i) {
  this.data +=
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF);
};

/**
 * Puts a 32-bit integer in this buffer in big-endian order.
 *
 * @param i the 32-bit integer.
 */
util.ByteBuffer.prototype.putInt32 = function(i) {
  this.data +=
    String.fromCharCode(i >> 24 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF);
};

/**
 * Puts a 16-bit integer in this buffer in little-endian order.
 *
 * @param i the 16-bit integer.
 */
util.ByteBuffer.prototype.putInt16Le = function(i) {
  this.data +=
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF);
};

/**
 * Puts a 24-bit integer in this buffer in little-endian order.
 *
 * @param i the 24-bit integer.
 */
util.ByteBuffer.prototype.putInt24Le = function(i) {
  this.data +=
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF);
};

/**
 * Puts a 32-bit integer in this buffer in little-endian order.
 *
 * @param i the 32-bit integer.
 */
util.ByteBuffer.prototype.putInt32Le = function(i) {
  this.data +=
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 24 & 0xFF);
};

/**
 * Puts an n-bit integer in this buffer in big-endian order.
 *
 * @param i the n-bit integer.
 * @param n the number of bits in the integer.
 */
util.ByteBuffer.prototype.putInt = function(i, n) {
  do {
    n -= 8;
    this.data += String.fromCharCode((i >> n) & 0xFF);
  }
  while(n > 0);
};

/**
 * Puts the given buffer into this buffer.
 *
 * @param buffer the buffer to put into this one.
 */
util.ByteBuffer.prototype.putBuffer = function(buffer) {
  this.data += buffer.getBytes();
};

/**
 * Gets a byte from this buffer and advances the read pointer by 1.
 *
 * @return the byte.
 */
util.ByteBuffer.prototype.getByte = function() {
  return this.data.charCodeAt(this.read++);
};

/**
 * Gets a uint16 from this buffer in big-endian order and advances the read
 * pointer by 2.
 *
 * @return the uint16.
 */
util.ByteBuffer.prototype.getInt16 = function() {
  var rval = (
    this.data.charCodeAt(this.read) << 8 ^
    this.data.charCodeAt(this.read + 1));
  this.read += 2;
  return rval;
};

/**
 * Gets a uint24 from this buffer in big-endian order and advances the read
 * pointer by 3.
 *
 * @return the uint24.
 */
util.ByteBuffer.prototype.getInt24 = function() {
  var rval = (
    this.data.charCodeAt(this.read) << 16 ^
    this.data.charCodeAt(this.read + 1) << 8 ^
    this.data.charCodeAt(this.read + 2));
  this.read += 3;
  return rval;
};

/**
 * Gets a uint32 from this buffer in big-endian order and advances the read
 * pointer by 4.
 *
 * @return the word.
 */
util.ByteBuffer.prototype.getInt32 = function() {
  var rval = (
    this.data.charCodeAt(this.read) << 24 ^
    this.data.charCodeAt(this.read + 1) << 16 ^
    this.data.charCodeAt(this.read + 2) << 8 ^
    this.data.charCodeAt(this.read + 3));
  this.read += 4;
  return rval;
};

/**
 * Gets a uint16 from this buffer in little-endian order and advances the read
 * pointer by 2.
 *
 * @return the uint16.
 */
util.ByteBuffer.prototype.getInt16Le = function() {
  var rval = (
    this.data.charCodeAt(this.read) ^
    this.data.charCodeAt(this.read + 1) << 8);
  this.read += 2;
  return rval;
};

/**
 * Gets a uint24 from this buffer in little-endian order and advances the read
 * pointer by 3.
 *
 * @return the uint24.
 */
util.ByteBuffer.prototype.getInt24Le = function() {
  var rval = (
    this.data.charCodeAt(this.read) ^
    this.data.charCodeAt(this.read + 1) << 8 ^
    this.data.charCodeAt(this.read + 2) << 16);
  this.read += 3;
  return rval;
};

/**
 * Gets a uint32 from this buffer in little-endian order and advances the read
 * pointer by 4.
 *
 * @return the word.
 */
util.ByteBuffer.prototype.getInt32Le = function() {
  var rval = (
    this.data.charCodeAt(this.read) ^
    this.data.charCodeAt(this.read + 1) << 8 ^
    this.data.charCodeAt(this.read + 2) << 16 ^
    this.data.charCodeAt(this.read + 3) << 24);
  this.read += 4;
  return rval;
};

/**
 * Gets an n-bit integer from this buffer in big-endian order and advances the
 * read pointer by n/8.
 *
 * @param n the number of bits in the integer.
 *
 * @return the integer.
 */
util.ByteBuffer.prototype.getInt = function(n) {
  var rval = 0;
  do {
    rval = (rval << n) + this.data.charCodeAt(this.read++);
    n -= 8;
  }
  while(n > 0);
  return rval;
};

/**
 * Reads bytes out into a UTF-8 string and clears them from the buffer.
 *
 * @param count the number of bytes to read, undefined or null for all.
 *
 * @return a UTF-8 string of bytes.
 */
util.ByteBuffer.prototype.getBytes = function(count) {
  var rval;
  if(count) {
    // read count bytes
    count = Math.min(this.length(), count);
    rval = this.data.slice(this.read, this.read + count);
    this.read += count;
  }
  else if(count === 0) {
    rval = '';
  }
  else {
    // read all bytes, optimize to only copy when needed
    rval = (this.read === 0) ? this.data : this.data.slice(this.read);
    this.clear();
  }
  return rval;
};

/**
 * Gets a UTF-8 encoded string of the bytes from this buffer without modifying
 * the read pointer.
 *
 * @param count the number of bytes to get, omit to get all.
 *
 * @return a string full of UTF-8 encoded characters.
 */
util.ByteBuffer.prototype.bytes = function(count) {
  return (typeof(count) === 'undefined' ?
    this.data.slice(this.read) :
    this.data.slice(this.read, this.read + count));
};

/**
 * Gets a byte at the given index without modifying the read pointer.
 *
 * @param i the byte index.
 *
 * @return the byte.
 */
util.ByteBuffer.prototype.at = function(i) {
  return this.data.charCodeAt(this.read + i);
};

/**
 * Puts a byte at the given index without modifying the read pointer.
 *
 * @param i the byte index.
 * @param b the byte to put.
 */
util.ByteBuffer.prototype.setAt = function(i, b) {
  this.data = this.data.substr(0, this.read + i) +
    String.fromCharCode(b) +
    this.data.substr(this.read + i + 1);
};

/**
 * Gets the last byte without modifying the read pointer.
 *
 * @return the last byte.
 */
util.ByteBuffer.prototype.last = function() {
  return this.data.charCodeAt(this.data.length - 1);
};

/**
 * Creates a copy of this buffer.
 *
 * @return the copy.
 */
util.ByteBuffer.prototype.copy = function() {
  var c = util.createBuffer(this.data);
  c.read = this.read;
  return c;
};

/**
 * Compacts this buffer.
 */
util.ByteBuffer.prototype.compact = function() {
  if(this.read > 0) {
    this.data = this.data.slice(this.read);
    this.read = 0;
  }
};

/**
 * Clears this buffer.
 */
util.ByteBuffer.prototype.clear = function() {
  this.data = '';
  this.read = 0;
};

/**
 * Shortens this buffer by triming bytes off of the end of this buffer.
 *
 * @param count the number of bytes to trim off.
 */
util.ByteBuffer.prototype.truncate = function(count) {
  var len = Math.max(0, this.length() - count);
  this.data = this.data.substr(this.read, len);
  this.read = 0;
};

/**
 * Converts this buffer to a hexadecimal string.
 *
 * @return a hexadecimal string.
 */
util.ByteBuffer.prototype.toHex = function() {
  var rval = '';
  for(var i = this.read; i < this.data.length; ++i) {
    var b = this.data.charCodeAt(i);
    if(b < 16) {
      rval += '0';
    }
    rval += b.toString(16);
  }
  return rval;
};

/**
 * Converts this buffer to a UTF-16 string (standard JavaScript string).
 *
 * @return a UTF-16 string.
 */
util.ByteBuffer.prototype.toString = function() {
  return util.decodeUtf8(this.bytes());
};
/**
 * util.createBuffer
 */

util.createBuffer = function(input, encoding) {
  encoding = encoding || 'raw';
  if(input !== undefined && encoding === 'utf8') {
    input = util.encodeUtf8(input);
  }
  return new util.ByteBuffer(input);
};

/**
 * prng.create
 */

var prng = forge.prng = {};
var crypto = null;

prng.create = function(plugin) {
  var ctx = {
    plugin: plugin,
    key: null,
    seed: null,
    time: null,
    // number of reseeds so far
    reseeds: 0,
    // amount of data generated so far
    generated: 0
  };

  // create 32 entropy pools (each is a message digest)
  var md = plugin.md;
  var pools = new Array(32);
  for(var i = 0; i < 32; ++i) {
    pools[i] = md.create();
  }
  ctx.pools = pools;

  // entropy pools are written to cyclically, starting at index 0
  ctx.pool = 0;

  /**
   * Generates random bytes. The bytes may be generated synchronously or
   * asynchronously. Web workers must use the asynchronous interface or
   * else the behavior is undefined.
   *
   * @param count the number of random bytes to generate.
   * @param [callback(err, bytes)] called once the operation completes.
   *
   * @return count random bytes as a string.
   */
  ctx.generate = function(count, callback) {
    // do synchronously
    if(!callback) {
      return ctx.generateSync(count);
    }

    // simple generator using counter-based CBC
    var cipher = ctx.plugin.cipher;
    var increment = ctx.plugin.increment;
    var formatKey = ctx.plugin.formatKey;
    var formatSeed = ctx.plugin.formatSeed;
    var b = forge.util.createBuffer();

    generate();

    function generate(err) {
      if(err) {
        return callback(err);
      }

      // sufficient bytes generated
      if(b.length() >= count) {
        return callback(null, b.getBytes(count));
      }

      // if amount of data generated is greater than 1 MiB, trigger reseed
      if(ctx.generated >= 1048576) {
        // only do reseed at most every 100 ms
        var now = +new Date();
        if(ctx.time === null || (now - ctx.time > 100)) {
          ctx.key = null;
        }
      }

      if(ctx.key === null) {
        return _reseed(generate);
      }

      // generate the random bytes
      var bytes = cipher(ctx.key, ctx.seed);
      ctx.generated += bytes.length;
      b.putBytes(bytes);

      // generate bytes for a new key and seed
      ctx.key = formatKey(cipher(ctx.key, increment(ctx.seed)));
      ctx.seed = formatSeed(cipher(ctx.key, ctx.seed));

      forge.util.setImmediate(generate);
    }
  };

  /**
   * Generates random bytes synchronously.
   *
   * @param count the number of random bytes to generate.
   *
   * @return count random bytes as a string.
   */
  ctx.generateSync = function(count) {
    // simple generator using counter-based CBC
    var cipher = ctx.plugin.cipher;
    var increment = ctx.plugin.increment;
    var formatKey = ctx.plugin.formatKey;
    var formatSeed = ctx.plugin.formatSeed;
    var b = forge.util.createBuffer();
    while(b.length() < count) {
      // if amount of data generated is greater than 1 MiB, trigger reseed
      if(ctx.generated >= 1048576) {
        // only do reseed at most every 100 ms
        var now = +new Date();
        if(ctx.time === null || (now - ctx.time > 100)) {
          ctx.key = null;
        }
      }

      if(ctx.key === null) {
        _reseedSync();
      }

      // generate the random bytes
      var bytes = cipher(ctx.key, ctx.seed);
      ctx.generated += bytes.length;
      b.putBytes(bytes);

      // generate bytes for a new key and seed
      ctx.key = formatKey(cipher(ctx.key, increment(ctx.seed)));
      ctx.seed = formatSeed(cipher(ctx.key, ctx.seed));
    }

    return b.getBytes(count);
  };

  /**
   * Private function that asynchronously reseeds a generator.
   *
   * @param callback(err) called once the operation completes.
   */
  function _reseed(callback) {
    if(ctx.pools[0].messageLength >= 32) {
      _seed();
      return callback();
    }
    // not enough seed data...
    var needed = (32 - ctx.pools[0].messageLength) << 5;
    ctx.seedFile(needed, function(err, bytes) {
      if(err) {
        return callback(err);
      }
      ctx.collect(bytes);
      _seed();
      callback();
    });
  }

  /**
   * Private function that synchronously reseeds a generator.
   */
  function _reseedSync() {
    if(ctx.pools[0].messageLength >= 32) {
      return _seed();
    }
    // not enough seed data...
    var needed = (32 - ctx.pools[0].messageLength) << 5;
    ctx.collect(ctx.seedFileSync(needed));
    _seed();
  }

  /**
   * Private function that seeds a generator once enough bytes are available.
   */
  function _seed() {
    // create a SHA-1 message digest
    var md = forge.md.sha1.create();

    // digest pool 0's entropy and restart it
    md.update(ctx.pools[0].digest().getBytes());
    ctx.pools[0].start();

    // digest the entropy of other pools whose index k meet the
    // condition '2^k mod n == 0' where n is the number of reseeds
    var k = 1;
    for(var i = 1; i < 32; ++i) {
      // prevent signed numbers from being used
      k = (k === 31) ? 0x80000000 : (k << 2);
      if(k % ctx.reseeds === 0) {
        md.update(ctx.pools[i].digest().getBytes());
        ctx.pools[i].start();
      }
    }

    // get digest for key bytes and iterate again for seed bytes
    var keyBytes = md.digest().getBytes();
    md.start();
    md.update(keyBytes);
    var seedBytes = md.digest().getBytes();

    // update
    ctx.key = ctx.plugin.formatKey(keyBytes);
    ctx.seed = ctx.plugin.formatSeed(seedBytes);
    ++ctx.reseeds;
    ctx.generated = 0;
    ctx.time = +new Date();
  }

  /**
   * The built-in default seedFile. This seedFile is used when entropy
   * is needed immediately.
   *
   * @param needed the number of bytes that are needed.
   *
   * @return the random bytes.
   */
  function defaultSeedFile(needed) {
    // use window.crypto.getRandomValues strong source of entropy if
    // available
    var b = forge.util.createBuffer();
    if(typeof window !== 'undefined' &&
      window.crypto && window.crypto.getRandomValues) {
      var entropy = new Uint32Array(needed / 4);
      try {
        window.crypto.getRandomValues(entropy);
        for(var i = 0; i < entropy.length; ++i) {
          b.putInt32(entropy[i]);
        }
      }
      catch(e) {
        /* Mozilla claims getRandomValues can throw QuotaExceededError, so
         ignore errors. In this case, weak entropy will be added, but
         hopefully this never happens.
         https://developer.mozilla.org/en-US/docs/DOM/window.crypto.getRandomValues
         However I've never observed this exception --@evanj */
      }
    }

    // be sad and add some weak random data
    if(b.length() < needed) {
      /* Draws from Park-Miller "minimal standard" 31 bit PRNG,
      implemented with David G. Carta's optimization: with 32 bit math
      and without division (Public Domain). */
      var hi, lo, next;
      var seed = Math.floor(Math.random() * 0xFFFF);
      while(b.length() < needed) {
        lo = 16807 * (seed & 0xFFFF);
        hi = 16807 * (seed >> 16);
        lo += (hi & 0x7FFF) << 16;
        lo += hi >> 15;
        lo = (lo & 0x7FFFFFFF) + (lo >> 31);
        seed = lo & 0xFFFFFFFF;

        // consume lower 3 bytes of seed
        for(var i = 0; i < 3; ++i) {
          // throw in more pseudo random
          next = seed >>> (i << 3);
          next ^= Math.floor(Math.random() * 0xFF);
          b.putByte(String.fromCharCode(next & 0xFF));
        }
      }
    }

    return b.getBytes();
  }
  // initialize seed file APIs
  if(crypto) {
    // use nodejs async API
    ctx.seedFile = function(needed, callback) {
      crypto.randomBytes(needed, function(err, bytes) {
        if(err) {
          return callback(err);
        }
        callback(null, bytes.toString());
      });
    };
    // use nodejs sync API
    ctx.seedFileSync = function(needed) {
      return crypto.randomBytes(needed).toString();
    };
  }
  else {
    ctx.seedFile = function(needed, callback) {
      try {
        callback(null, defaultSeedFile(needed));
      }
      catch(e) {
        callback(e);
      }
    };
    ctx.seedFileSync = defaultSeedFile;
  }

  /**
   * Adds entropy to a prng ctx's accumulator.
   *
   * @param bytes the bytes of entropy as a string.
   */
  ctx.collect = function(bytes) {
    // iterate over pools distributing entropy cyclically
    var count = bytes.length;
    for(var i = 0; i < count; ++i) {
      ctx.pools[ctx.pool].update(bytes.substr(i, 1));
      ctx.pool = (ctx.pool === 31) ? 0 : ctx.pool + 1;
    }
  };

  /**
   * Collects an integer of n bits.
   *
   * @param i the integer entropy.
   * @param n the number of bits in the integer.
   */
  ctx.collectInt = function(i, n) {
    var bytes = '';
    for(var x = 0; x < n; x += 8) {
      bytes += String.fromCharCode((i >> x) & 0xFF);
    }
    ctx.collect(bytes);
  };

  /**
   * Registers a Web Worker to receive immediate entropy from the main thread.
   * This method is required until Web Workers can access the native crypto
   * API. This method should be called twice for each created worker, once in
   * the main thread, and once in the worker itself.
   *
   * @param worker the worker to register.
   */
  ctx.registerWorker = function(worker) {
    // worker receives random bytes
    if(worker === self) {
      ctx.seedFile = function(needed, callback) {
        function listener(e) {
          var data = e.data;
          if(data.forge && data.forge.prng) {
            self.removeEventListener('message', listener);
            callback(data.forge.prng.err, data.forge.prng.bytes);
          }
        }
        self.addEventListener('message', listener);
        self.postMessage({forge: {prng: {needed: needed}}});
      };
    }
    // main thread sends random bytes upon request
    else {
      function listener(e) {
        var data = e.data;
        if(data.forge && data.forge.prng) {
          ctx.seedFile(data.forge.prng.needed, function(err, bytes) {
            worker.postMessage({forge: {prng: {err: err, bytes: bytes}}});
          });
        }
      }
      // TODO: do we need to remove the event listener when the worker dies?
      worker.addEventListener('message', listener);
    }
  };

  return ctx;
};

/**
 * aes._expendKey
 */

var init = false; // not yet initialized
var Nb = 4;       // number of words comprising the state (AES = 4)
var sbox;         // non-linear substitution table used in key expansion
var isbox;        // inversion of sbox
var rcon;         // round constant word array
var mix;          // mix-columns table
var imix;         // inverse mix-columns table

var initialize = function() {
  init = true;

  /* Populate the Rcon table. These are the values given by
    [x^(i-1),{00},{00},{00}] where x^(i-1) are powers of x (and x = 0x02)
    in the field of GF(2^8), where i starts at 1.

    rcon[0] = [0x00, 0x00, 0x00, 0x00]
    rcon[1] = [0x01, 0x00, 0x00, 0x00] 2^(1-1) = 2^0 = 1
    rcon[2] = [0x02, 0x00, 0x00, 0x00] 2^(2-1) = 2^1 = 2
    ...
    rcon[9]  = [0x1B, 0x00, 0x00, 0x00] 2^(9-1)  = 2^8 = 0x1B
    rcon[10] = [0x36, 0x00, 0x00, 0x00] 2^(10-1) = 2^9 = 0x36

    We only store the first byte because it is the only one used.
  */
  rcon = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36];

  // compute xtime table which maps i onto GF(i, 0x02)
  var xtime = new Array(256);
  for(var i = 0; i < 128; ++i) {
    xtime[i] = i << 1;
    xtime[i + 128] = (i + 128) << 1 ^ 0x11B;
  }

  // compute all other tables
  sbox = new Array(256);
  isbox = new Array(256);
  mix = new Array(4);
  imix = new Array(4);
  for(var i = 0; i < 4; ++i) {
    mix[i] = new Array(256);
    imix[i] = new Array(256);
  }
  var e = 0, ei = 0, e2, e4, e8, sx, sx2, me, ime;
  for(var i = 0; i < 256; ++i) {
    /* We need to generate the SubBytes() sbox and isbox tables so that
      we can perform byte substitutions. This requires us to traverse
      all of the elements in GF, find their multiplicative inverses,
      and apply to each the following affine transformation:

      bi' = bi ^ b(i + 4) mod 8 ^ b(i + 5) mod 8 ^ b(i + 6) mod 8 ^
            b(i + 7) mod 8 ^ ci
      for 0 <= i < 8, where bi is the ith bit of the byte, and ci is the
      ith bit of a byte c with the value {63} or {01100011}.

      It is possible to traverse every possible value in a Galois field
      using what is referred to as a 'generator'. There are many
      generators (128 out of 256): 3,5,6,9,11,82 to name a few. To fully
      traverse GF we iterate 255 times, multiplying by our generator
      each time.

      On each iteration we can determine the multiplicative inverse for
      the current element.

      Suppose there is an element in GF 'e'. For a given generator 'g',
      e = g^x. The multiplicative inverse of e is g^(255 - x). It turns
      out that if use the inverse of a generator as another generator
      it will produce all of the corresponding multiplicative inverses
      at the same time. For this reason, we choose 5 as our inverse
      generator because it only requires 2 multiplies and 1 add and its
      inverse, 82, requires relatively few operations as well.

      In order to apply the affine transformation, the multiplicative
      inverse 'ei' of 'e' can be repeatedly XOR'd (4 times) with a
      bit-cycling of 'ei'. To do this 'ei' is first stored in 's' and
      'x'. Then 's' is left shifted and the high bit of 's' is made the
      low bit. The resulting value is stored in 's'. Then 'x' is XOR'd
      with 's' and stored in 'x'. On each subsequent iteration the same
      operation is performed. When 4 iterations are complete, 'x' is
      XOR'd with 'c' (0x63) and the transformed value is stored in 'x'.
      For example:

      s = 01000001
      x = 01000001

      iteration 1: s = 10000010, x ^= s
      iteration 2: s = 00000101, x ^= s
      iteration 3: s = 00001010, x ^= s
      iteration 4: s = 00010100, x ^= s
      x ^= 0x63

      This can be done with a loop where s = (s << 1) | (s >> 7). However,
      it can also be done by using a single 16-bit (in this case 32-bit)
      number 'sx'. Since XOR is an associative operation, we can set 'sx'
      to 'ei' and then XOR it with 'sx' left-shifted 1,2,3, and 4 times.
      The most significant bits will flow into the high 8 bit positions
      and be correctly XOR'd with one another. All that remains will be
      to cycle the high 8 bits by XOR'ing them all with the lower 8 bits
      afterwards.

      At the same time we're populating sbox and isbox we can precompute
      the multiplication we'll need to do to do MixColumns() later.
    */

    // apply affine transformation
    sx = ei ^ (ei << 1) ^ (ei << 2) ^ (ei << 3) ^ (ei << 4);
    sx = (sx >> 8) ^ (sx & 255) ^ 0x63;

    // update tables
    sbox[e] = sx;
    isbox[sx] = e;

    /* Mixing columns is done using matrix multiplication. The columns
      that are to be mixed are each a single word in the current state.
      The state has Nb columns (4 columns). Therefore each column is a
      4 byte word. So to mix the columns in a single column 'c' where
      its rows are r0, r1, r2, and r3, we use the following matrix
      multiplication:

      [2 3 1 1]*[r0,c]=[r'0,c]
      [1 2 3 1] [r1,c] [r'1,c]
      [1 1 2 3] [r2,c] [r'2,c]
      [3 1 1 2] [r3,c] [r'3,c]

      r0, r1, r2, and r3 are each 1 byte of one of the words in the
      state (a column). To do matrix multiplication for each mixed
      column c' we multiply the corresponding row from the left matrix
      with the corresponding column from the right matrix. In total, we
      get 4 equations:

      r0,c' = 2*r0,c + 3*r1,c + 1*r2,c + 1*r3,c
      r1,c' = 1*r0,c + 2*r1,c + 3*r2,c + 1*r3,c
      r2,c' = 1*r0,c + 1*r1,c + 2*r2,c + 3*r3,c
      r3,c' = 3*r0,c + 1*r1,c + 1*r2,c + 2*r3,c

      As usual, the multiplication is as previously defined and the
      addition is XOR. In order to optimize mixing columns we can store
      the multiplication results in tables. If you think of the whole
      column as a word (it might help to visualize by mentally rotating
      the equations above by counterclockwise 90 degrees) then you can
      see that it would be useful to map the multiplications performed on
      each byte (r0, r1, r2, r3) onto a word as well. For instance, we
      could map 2*r0,1*r0,1*r0,3*r0 onto a word by storing 2*r0 in the
      highest 8 bits and 3*r0 in the lowest 8 bits (with the other two
      respectively in the middle). This means that a table can be
      constructed that uses r0 as an index to the word. We can do the
      same with r1, r2, and r3, creating a total of 4 tables.

      To construct a full c', we can just look up each byte of c in
      their respective tables and XOR the results together.

      Also, to build each table we only have to calculate the word
      for 2,1,1,3 for every byte ... which we can do on each iteration
      of this loop since we will iterate over every byte. After we have
      calculated 2,1,1,3 we can get the results for the other tables
      by cycling the byte at the end to the beginning. For instance
      we can take the result of table 2,1,1,3 and produce table 3,2,1,1
      by moving the right most byte to the left most position just like
      how you can imagine the 3 moved out of 2,1,1,3 and to the front
      to produce 3,2,1,1.

      There is another optimization in that the same multiples of
      the current element we need in order to advance our generator
      to the next iteration can be reused in performing the 2,1,1,3
      calculation. We also calculate the inverse mix column tables,
      with e,9,d,b being the inverse of 2,1,1,3.

      When we're done, and we need to actually mix columns, the first
      byte of each state word should be put through mix[0] (2,1,1,3),
      the second through mix[1] (3,2,1,1) and so forth. Then they should
      be XOR'd together to produce the fully mixed column.
    */

    // calculate mix and imix table values
    sx2 = xtime[sx];
    e2 = xtime[e];
    e4 = xtime[e2];
    e8 = xtime[e4];
    me =
      (sx2 << 24) ^  // 2
      (sx << 16) ^   // 1
      (sx << 8) ^    // 1
      (sx ^ sx2);    // 3
    ime =
      (e2 ^ e4 ^ e8) << 24 ^  // E (14)
      (e ^ e8) << 16 ^        // 9
      (e ^ e4 ^ e8) << 8 ^    // D (13)
      (e ^ e2 ^ e8);          // B (11)
    // produce each of the mix tables by rotating the 2,1,1,3 value
    for(var n = 0; n < 4; ++n) {
      mix[n][e] = me;
      imix[n][sx] = ime;
      // cycle the right most byte to the left most position
      // ie: 2,1,1,3 becomes 3,2,1,1
      me = me << 24 | me >>> 8;
      ime = ime << 24 | ime >>> 8;
    }

    // get next element and inverse
    if(e === 0) {
      // 1 is the inverse of 1
      e = ei = 1;
    }
    else {
      // e = 2e + 2*2*2*(10e)) = multiply e by 82 (chosen generator)
      // ei = ei + 2*2*ei = multiply ei by 5 (inverse generator)
      e = e2 ^ xtime[xtime[xtime[e2 ^ e8]]];
      ei ^= xtime[xtime[ei]];
    }
  }
};

/**
 * Generates a key schedule using the AES key expansion algorithm.
 *
 * The AES algorithm takes the Cipher Key, K, and performs a Key Expansion
 * routine to generate a key schedule. The Key Expansion generates a total
 * of Nb*(Nr + 1) words: the algorithm requires an initial set of Nb words,
 * and each of the Nr rounds requires Nb words of key data. The resulting
 * key schedule consists of a linear array of 4-byte words, denoted [wi ],
 * with i in the range 0 ≤ i < Nb(Nr + 1).
 *
 * KeyExpansion(byte key[4*Nk], word w[Nb*(Nr+1)], Nk)
 * AES-128 (Nb=4, Nk=4, Nr=10)
 * AES-192 (Nb=4, Nk=6, Nr=12)
 * AES-256 (Nb=4, Nk=8, Nr=14)
 * Note: Nr=Nk+6.
 *
 * Nb is the number of columns (32-bit words) comprising the State (or
 * number of bytes in a block). For AES, Nb=4.
 *
 * @param key the key to schedule (as an array of 32-bit words).
 * @param decrypt true to modify the key schedule to decrypt, false not to.
 *
 * @return the generated key schedule.
 */
var expandKey = function(key, decrypt) {
  // copy the key's words to initialize the key schedule
  var w = key.slice(0);

  /* RotWord() will rotate a word, moving the first byte to the last
    byte's position (shifting the other bytes left).

    We will be getting the value of Rcon at i / Nk. 'i' will iterate
    from Nk to (Nb * Nr+1). Nk = 4 (4 byte key), Nb = 4 (4 words in
    a block), Nr = Nk + 6 (10). Therefore 'i' will iterate from
    4 to 44 (exclusive). Each time we iterate 4 times, i / Nk will
    increase by 1. We use a counter iNk to keep track of this.
   */

  // go through the rounds expanding the key
  var temp, iNk = 1;
  var Nk = w.length;
  var Nr1 = Nk + 6 + 1;
  var end = Nb * Nr1;
  for(var i = Nk; i < end; ++i) {
    temp = w[i - 1];
    if(i % Nk === 0) {
      // temp = SubWord(RotWord(temp)) ^ Rcon[i / Nk]
      temp =
        sbox[temp >>> 16 & 255] << 24 ^
        sbox[temp >>> 8 & 255] << 16 ^
        sbox[temp & 255] << 8 ^
        sbox[temp >>> 24] ^ (rcon[iNk] << 24);
      iNk++;
    }
    else if(Nk > 6 && (i % Nk == 4)) {
      // temp = SubWord(temp)
      temp =
        sbox[temp >>> 24] << 24 ^
        sbox[temp >>> 16 & 255] << 16 ^
        sbox[temp >>> 8 & 255] << 8 ^
        sbox[temp & 255];
    }
    w[i] = w[i - Nk] ^ temp;
  }

   /* When we are updating a cipher block we always use the code path for
     encryption whether we are decrypting or not (to shorten code and
     simplify the generation of look up tables). However, because there
     are differences in the decryption algorithm, other than just swapping
     in different look up tables, we must transform our key schedule to
     account for these changes:

     1. The decryption algorithm gets its key rounds in reverse order.
     2. The decryption algorithm adds the round key before mixing columns
       instead of afterwards.

     We don't need to modify our key schedule to handle the first case,
     we can just traverse the key schedule in reverse order when decrypting.

     The second case requires a little work.

     The tables we built for performing rounds will take an input and then
     perform SubBytes() and MixColumns() or, for the decrypt version,
     InvSubBytes() and InvMixColumns(). But the decrypt algorithm requires
     us to AddRoundKey() before InvMixColumns(). This means we'll need to
     apply some transformations to the round key to inverse-mix its columns
     so they'll be correct for moving AddRoundKey() to after the state has
     had its columns inverse-mixed.

     To inverse-mix the columns of the state when we're decrypting we use a
     lookup table that will apply InvSubBytes() and InvMixColumns() at the
     same time. However, the round key's bytes are not inverse-substituted
     in the decryption algorithm. To get around this problem, we can first
     substitute the bytes in the round key so that when we apply the
     transformation via the InvSubBytes()+InvMixColumns() table, it will
     undo our substitution leaving us with the original value that we
     want -- and then inverse-mix that value.

     This change will correctly alter our key schedule so that we can XOR
     each round key with our already transformed decryption state. This
     allows us to use the same code path as the encryption algorithm.

     We make one more change to the decryption key. Since the decryption
     algorithm runs in reverse from the encryption algorithm, we reverse
     the order of the round keys to avoid having to iterate over the key
     schedule backwards when running the encryption algorithm later in
     decryption mode. In addition to reversing the order of the round keys,
     we also swap each round key's 2nd and 4th rows. See the comments
     section where rounds are performed for more details about why this is
     done. These changes are done inline with the other substitution
     described above.
  */
  if(decrypt) {
    var tmp;
    var m0 = imix[0];
    var m1 = imix[1];
    var m2 = imix[2];
    var m3 = imix[3];
    var wnew = w.slice(0);
    var end = w.length;
    for(var i = 0, wi = end - Nb; i < end; i += Nb, wi -= Nb) {
      // do not sub the first or last round key (round keys are Nb
      // words) as no column mixing is performed before they are added,
      // but do change the key order
      if(i === 0 || i === (end - Nb)) {
        wnew[i] = w[wi];
        wnew[i + 1] = w[wi + 3];
        wnew[i + 2] = w[wi + 2];
        wnew[i + 3] = w[wi + 1];
      }
      else {
        // substitute each round key byte because the inverse-mix
        // table will inverse-substitute it (effectively cancel the
        // substitution because round key bytes aren't sub'd in
        // decryption mode) and swap indexes 3 and 1
        for(var n = 0; n < Nb; ++n) {
          tmp = w[wi + n];
          wnew[i + (3&-n)] =
            m0[sbox[tmp >>> 24]] ^
            m1[sbox[tmp >>> 16 & 255]] ^
            m2[sbox[tmp >>> 8 & 255]] ^
            m3[sbox[tmp & 255]];
        }
      }
    }
    w = wnew;
  }

  return w;
};


forge.aes._expandKey = function(key, decrypt) {
  if(!init) {
    initialize();
  }
  return expandKey(key, decrypt);
};

/**
 * aes._updateBlock
 */

var _updateBlock = function(w, input, output, decrypt) {
  /*
  Cipher(byte in[4*Nb], byte out[4*Nb], word w[Nb*(Nr+1)])
  begin
    byte state[4,Nb]
    state = in
    AddRoundKey(state, w[0, Nb-1])
    for round = 1 step 1 to Nr–1
      SubBytes(state)
      ShiftRows(state)
      MixColumns(state)
      AddRoundKey(state, w[round*Nb, (round+1)*Nb-1])
    end for
    SubBytes(state)
    ShiftRows(state)
    AddRoundKey(state, w[Nr*Nb, (Nr+1)*Nb-1])
    out = state
  end

  InvCipher(byte in[4*Nb], byte out[4*Nb], word w[Nb*(Nr+1)])
  begin
    byte state[4,Nb]
    state = in
    AddRoundKey(state, w[Nr*Nb, (Nr+1)*Nb-1])
    for round = Nr-1 step -1 downto 1
      InvShiftRows(state)
      InvSubBytes(state)
      AddRoundKey(state, w[round*Nb, (round+1)*Nb-1])
      InvMixColumns(state)
    end for
    InvShiftRows(state)
    InvSubBytes(state)
    AddRoundKey(state, w[0, Nb-1])
    out = state
  end
  */

  // Encrypt: AddRoundKey(state, w[0, Nb-1])
  // Decrypt: AddRoundKey(state, w[Nr*Nb, (Nr+1)*Nb-1])
  var Nr = w.length / 4 - 1;
  var m0, m1, m2, m3, sub;
  if(decrypt) {
    m0 = imix[0];
    m1 = imix[1];
    m2 = imix[2];
    m3 = imix[3];
    sub = isbox;
  }
  else {
    m0 = mix[0];
    m1 = mix[1];
    m2 = mix[2];
    m3 = mix[3];
    sub = sbox;
  }
  var a, b, c, d, a2, b2, c2;
  a = input[0] ^ w[0];
  b = input[decrypt ? 3 : 1] ^ w[1];
  c = input[2] ^ w[2];
  d = input[decrypt ? 1 : 3] ^ w[3];
  var i = 3;

  /* In order to share code we follow the encryption algorithm when both
    encrypting and decrypting. To account for the changes required in the
    decryption algorithm, we use different lookup tables when decrypting
    and use a modified key schedule to account for the difference in the
    order of transformations applied when performing rounds. We also get
    key rounds in reverse order (relative to encryption). */
  for(var round = 1; round < Nr; ++round) {
    /* As described above, we'll be using table lookups to perform the
      column mixing. Each column is stored as a word in the state (the
      array 'input' has one column as a word at each index). In order to
      mix a column, we perform these transformations on each row in c,
      which is 1 byte in each word. The new column for c0 is c'0:

               m0      m1      m2      m3
      r0,c'0 = 2*r0,c0 + 3*r1,c0 + 1*r2,c0 + 1*r3,c0
      r1,c'0 = 1*r0,c0 + 2*r1,c0 + 3*r2,c0 + 1*r3,c0
      r2,c'0 = 1*r0,c0 + 1*r1,c0 + 2*r2,c0 + 3*r3,c0
      r3,c'0 = 3*r0,c0 + 1*r1,c0 + 1*r2,c0 + 2*r3,c0

      So using mix tables where c0 is a word with r0 being its upper
      8 bits and r3 being its lower 8 bits:

      m0[c0 >> 24] will yield this word: [2*r0,1*r0,1*r0,3*r0]
      ...
      m3[c0 & 255] will yield this word: [1*r3,1*r3,3*r3,2*r3]

      Therefore to mix the columns in each word in the state we
      do the following (& 255 omitted for brevity):
      c'0,r0 = m0[c0 >> 24] ^ m1[c1 >> 16] ^ m2[c2 >> 8] ^ m3[c3]
      c'0,r1 = m0[c0 >> 24] ^ m1[c1 >> 16] ^ m2[c2 >> 8] ^ m3[c3]
      c'0,r2 = m0[c0 >> 24] ^ m1[c1 >> 16] ^ m2[c2 >> 8] ^ m3[c3]
      c'0,r3 = m0[c0 >> 24] ^ m1[c1 >> 16] ^ m2[c2 >> 8] ^ m3[c3]

      However, before mixing, the algorithm requires us to perform
      ShiftRows(). The ShiftRows() transformation cyclically shifts the
      last 3 rows of the state over different offsets. The first row
      (r = 0) is not shifted.

      s'_r,c = s_r,(c + shift(r, Nb) mod Nb
      for 0 < r < 4 and 0 <= c < Nb and
      shift(1, 4) = 1
      shift(2, 4) = 2
      shift(3, 4) = 3.

      This causes the first byte in r = 1 to be moved to the end of
      the row, the first 2 bytes in r = 2 to be moved to the end of
      the row, the first 3 bytes in r = 3 to be moved to the end of
      the row:

      r1: [c0 c1 c2 c3] => [c1 c2 c3 c0]
      r2: [c0 c1 c2 c3]    [c2 c3 c0 c1]
      r3: [c0 c1 c2 c3]    [c3 c0 c1 c2]

      We can make these substitutions inline with our column mixing to
      generate an updated set of equations to produce each word in the
      state (note the columns have changed positions):

      c0 c1 c2 c3 => c0 c1 c2 c3
      c0 c1 c2 c3    c1 c2 c3 c0  (cycled 1 byte)
      c0 c1 c2 c3    c2 c3 c0 c1  (cycled 2 bytes)
      c0 c1 c2 c3    c3 c0 c1 c2  (cycled 3 bytes)

      Therefore:

      c'0 = 2*r0,c0 + 3*r1,c1 + 1*r2,c2 + 1*r3,c3
      c'0 = 1*r0,c0 + 2*r1,c1 + 3*r2,c2 + 1*r3,c3
      c'0 = 1*r0,c0 + 1*r1,c1 + 2*r2,c2 + 3*r3,c3
      c'0 = 3*r0,c0 + 1*r1,c1 + 1*r2,c2 + 2*r3,c3

      c'1 = 2*r0,c1 + 3*r1,c2 + 1*r2,c3 + 1*r3,c0
      c'1 = 1*r0,c1 + 2*r1,c2 + 3*r2,c3 + 1*r3,c0
      c'1 = 1*r0,c1 + 1*r1,c2 + 2*r2,c3 + 3*r3,c0
      c'1 = 3*r0,c1 + 1*r1,c2 + 1*r2,c3 + 2*r3,c0

      ... and so forth for c'2 and c'3. The important distinction is
      that the columns are cycling, with c0 being used with the m0
      map when calculating c0, but c1 being used with the m0 map when
      calculating c1 ... and so forth.

      When performing the inverse we transform the mirror image and
      skip the bottom row, instead of the top one, and move upwards:

      c3 c2 c1 c0 => c0 c3 c2 c1  (cycled 3 bytes) *same as encryption
      c3 c2 c1 c0    c1 c0 c3 c2  (cycled 2 bytes)
      c3 c2 c1 c0    c2 c1 c0 c3  (cycled 1 byte)  *same as encryption
      c3 c2 c1 c0    c3 c2 c1 c0

      If you compare the resulting matrices for ShiftRows()+MixColumns()
      and for InvShiftRows()+InvMixColumns() the 2nd and 4th columns are
      different (in encrypt mode vs. decrypt mode). So in order to use
      the same code to handle both encryption and decryption, we will
      need to do some mapping.

      If in encryption mode we let a=c0, b=c1, c=c2, d=c3, and r<N> be
      a row number in the state, then the resulting matrix in encryption
      mode for applying the above transformations would be:

      r1: a b c d
      r2: b c d a
      r3: c d a b
      r4: d a b c

      If we did the same in decryption mode we would get:

      r1: a d c b
      r2: b a d c
      r3: c b a d
      r4: d c b a

      If instead we swap d and b (set b=c3 and d=c1), then we get:

      r1: a b c d
      r2: d a b c
      r3: c d a b
      r4: b c d a

      Now the 1st and 3rd rows are the same as the encryption matrix. All
      we need to do then to make the mapping exactly the same is to swap
      the 2nd and 4th rows when in decryption mode. To do this without
      having to do it on each iteration, we swapped the 2nd and 4th rows
      in the decryption key schedule. We also have to do the swap above
      when we first pull in the input and when we set the final output. */
    a2 =
      m0[a >>> 24] ^
      m1[b >>> 16 & 255] ^
      m2[c >>> 8 & 255] ^
      m3[d & 255] ^ w[++i];
    b2 =
      m0[b >>> 24] ^
      m1[c >>> 16 & 255] ^
      m2[d >>> 8 & 255] ^
      m3[a & 255] ^ w[++i];
    c2 =
      m0[c >>> 24] ^
      m1[d >>> 16 & 255] ^
      m2[a >>> 8 & 255] ^
      m3[b & 255] ^ w[++i];
    d =
      m0[d >>> 24] ^
      m1[a >>> 16 & 255] ^
      m2[b >>> 8 & 255] ^
      m3[c & 255] ^ w[++i];
    a = a2;
    b = b2;
    c = c2;
  }

  /*
    Encrypt:
    SubBytes(state)
    ShiftRows(state)
    AddRoundKey(state, w[Nr*Nb, (Nr+1)*Nb-1])

    Decrypt:
    InvShiftRows(state)
    InvSubBytes(state)
    AddRoundKey(state, w[0, Nb-1])
   */
   // Note: rows are shifted inline
  output[0] =
    (sub[a >>> 24] << 24) ^
    (sub[b >>> 16 & 255] << 16) ^
    (sub[c >>> 8 & 255] << 8) ^
    (sub[d & 255]) ^ w[++i];
  output[decrypt ? 3 : 1] =
    (sub[b >>> 24] << 24) ^
    (sub[c >>> 16 & 255] << 16) ^
    (sub[d >>> 8 & 255] << 8) ^
    (sub[a & 255]) ^ w[++i];
  output[2] =
    (sub[c >>> 24] << 24) ^
    (sub[d >>> 16 & 255] << 16) ^
    (sub[a >>> 8 & 255] << 8) ^
    (sub[b & 255]) ^ w[++i];
  output[decrypt ? 1 : 3] =
    (sub[d >>> 24] << 24) ^
    (sub[a >>> 16 & 255] << 16) ^
    (sub[b >>> 8 & 255] << 8) ^
    (sub[c & 255]) ^ w[++i];
};


forge.aes._updateBlock = _updateBlock;

/**
 * random.generate
 */

// the default prng plugin, uses AES-128
var prng_aes = {};
var _prng_aes_output = new Array(4);
var _prng_aes_buffer = forge.util.createBuffer();
prng_aes.formatKey = function(key) {
  // convert the key into 32-bit integers
  var tmp = forge.util.createBuffer(key);
  key = new Array(4);
  key[0] = tmp.getInt32();
  key[1] = tmp.getInt32();
  key[2] = tmp.getInt32();
  key[3] = tmp.getInt32();

  // return the expanded key
  return forge.aes._expandKey(key, false);
};
prng_aes.formatSeed = function(seed) {
  // convert seed into 32-bit integers
  var tmp = forge.util.createBuffer(seed);
  seed = new Array(4);
  seed[0] = tmp.getInt32();
  seed[1] = tmp.getInt32();
  seed[2] = tmp.getInt32();
  seed[3] = tmp.getInt32();
  return seed;
};
prng_aes.cipher = function(key, seed) {
  forge.aes._updateBlock(key, seed, _prng_aes_output, false);
  _prng_aes_buffer.putInt32(_prng_aes_output[0]);
  _prng_aes_buffer.putInt32(_prng_aes_output[1]);
  _prng_aes_buffer.putInt32(_prng_aes_output[2]);
  _prng_aes_buffer.putInt32(_prng_aes_output[3]);
  return _prng_aes_buffer.getBytes();
};
prng_aes.increment = function(seed) {
  // FIXME: do we care about carry or signed issues?
  ++seed[3];
  return seed;
};
prng_aes.md = forge.md.sha1;

// create default prng context
var _ctx = forge.prng.create(prng_aes);

// add other sources of entropy only if window.crypto.getRandomValues is not
// available -- otherwise this source will be automatically used by the prng

if (typeof window == 'undefined' || !window.crypto || !window.crypto.getRandomValues) {
// if this is a web worker, do not use weak entropy, instead register to
  // receive strong entropy asynchronously from the main thread
  if(typeof window === 'undefined' || window.document === undefined) {
    // FIXME:
  }

  // get load time entropy
  _ctx.collectInt(+new Date(), 32);

  // add some entropy from navigator object
  if(typeof(navigator) !== 'undefined') {
    var _navBytes = '';
    for(var key in navigator) {
      try {
        if(typeof(navigator[key]) == 'string') {
          _navBytes += navigator[key];
        }
      }
      catch(e) {
        /* Some navigator keys might not be accessible, e.g. the geolocation
          attribute throws an exception if touched in Mozilla chrome://
          context.

          Silently ignore this and just don't use this as a source of
          entropy. */
      }
    }
    _ctx.collect(_navBytes);
    _navBytes = null;
  }
}

forge.random = _ctx;

/**
 * random.getBytes
 */

forge.random.getBytes = function(count, callback) {
  return forge.random.generate(count, callback);
};

/**
 * pki
 * @author Dave Longley
 * @author Stefan Siegl <stesie@brokenpipe.de>
 *
 * Copyright (c) 2010-2013 Digital Bazaar, Inc.
 * Copyright (c) 2012 Stefan Siegl <stesie@brokenpipe.de>
 */

/**
 * pki.rsa.createKeyPairGenerationState
 */

forge.pki.rsa.createKeyPairGenerationState = function(bits, e) {
  // set default bits
  if(typeof(bits) === 'string') {
    bits = parseInt(bits, 10);
  }
  bits = bits || 1024;

  // create prng with api that matches BigInteger secure random
  var rng = {
    // x is an array to fill with bytes
    nextBytes: function(x) {
      var b = forge.random.getBytes(x.length);
      for(var i = 0; i < x.length; ++i) {
        x[i] = b.charCodeAt(i);
      }
    }
  };

  var rval = {
    state: 0,
    bits: bits,
    rng: rng,
    eInt: e || 65537,
    e: new BigInteger(null),
    p: null,
    q: null,
    qBits: bits >> 1,
    pBits: bits - (bits >> 1),
    pqState: 0,
    num: null,
    keys: null
  };
  rval.e.fromInt(rval.eInt);

  return rval;
};

/**
 * jsbn.BigInteger
 */

var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
function BigInteger(a,b,c) {
  this.data = [];
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this.data[i++]+w.data[j]+c;
    c = Math.floor(v/0x4000000);
    w.data[j++] = v&0x3ffffff;
  }
  return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this.data[i]&0x7fff;
    var h = this.data[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w.data[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w.data[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this.data[i]&0x3fff;
    var h = this.data[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w.data[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w.data[j++] = l&0xfffffff;
  }
  return c;
}

// node.js (no browser)
if(typeof(navigator) === 'undefined')
{
   BigInteger.prototype.am = am3;
   dbits = 28;
}
else if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am2;
  dbits = 30;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am1;
  dbits = 26;
}
else { // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r.data[i] = this.data[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this.data[0] = x;
  else if(x < -1) this.data[0] = x+DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this.data[this.t++] = x;
    else if(sh+k > this.DB) {
      this.data[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this.data[this.t++] = (x>>(this.DB-sh));
    }
    else
      this.data[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this.data[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this.data[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this.data[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this.data[i]&((1<<p)-1))<<(k-p);
        d |= this.data[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this.data[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return (this.s<0)?-r:r;
  while(--i >= 0) if((r=this.data[i]-a.data[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this.data[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r.data[i+n] = this.data[i];
  for(i = n-1; i >= 0; --i) r.data[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r.data[i-n] = this.data[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r.data[i+ds+1] = (this.data[i]>>cbs)|c;
    c = (this.data[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r.data[i] = 0;
  r.data[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r.data[0] = this.data[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r.data[i-ds-1] |= (this.data[i]&bm)<<cbs;
    r.data[i-ds] = this.data[i]>>bs;
  }
  if(bs > 0) r.data[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this.data[i]-a.data[i];
    r.data[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this.data[i];
      r.data[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a.data[i];
      r.data[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r.data[i++] = this.DV+c;
  else if(c > 0) r.data[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r.data[i] = 0;
  for(i = 0; i < y.t; ++i) r.data[i+x.t] = x.am(0,y.data[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r.data[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x.data[i],r,2*i,0,1);
    if((r.data[i+x.t]+=x.am(i+1,2*x.data[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r.data[i+x.t] -= x.DV;
      r.data[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r.data[r.t-1] += x.am(i,x.data[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm.data[pm.t-1]); // normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y.data[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y.data[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r.data[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y); // "negative" y so we can replace sub with am later
  while(y.t < ys) y.data[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r.data[--i]==y0)?this.DM:Math.floor(r.data[i]*d1+(r.data[i-1]+e)*d2);
    if((r.data[i]+=y.am(0,qd,r,j,0,ys)) < qd) { // Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r.data[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);  // Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this.data[0];
  if((x&1) == 0) return 0;
  var y = x&3;    // y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;  // y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;  // y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff; // y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;    // y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2)  // pad x so am has enough room later
    x.data[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x.data[i]*mp mod DV
    var j = x.data[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x.data[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x.data[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x.data[j] >= x.DV) { x.data[j] -= x.DV; x.data[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this.data[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);

// jsbn2 lib

//Copyright (c) 2005-2009  Tom Wu
//All Rights Reserved.
//See "LICENSE" for details (See jsbn.js for LICENSE).

//Extended JavaScript BN functions, required for RSA private ops.

//Version 1.1: new BigInteger("0", 10) returns "proper" zero

//(public)
function bnClone() { var r = nbi(); this.copyTo(r); return r; }

//(public) return value as integer
function bnIntValue() {
if(this.s < 0) {
 if(this.t == 1) return this.data[0]-this.DV;
 else if(this.t == 0) return -1;
}
else if(this.t == 1) return this.data[0];
else if(this.t == 0) return 0;
// assumes 16 < DB < 32
return ((this.data[1]&((1<<(32-this.DB))-1))<<this.DB)|this.data[0];
}

//(public) return value as byte
function bnByteValue() { return (this.t==0)?this.s:(this.data[0]<<24)>>24; }

//(public) return value as short (assumes DB>=16)
function bnShortValue() { return (this.t==0)?this.s:(this.data[0]<<16)>>16; }

//(protected) return x s.t. r^x < DV
function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

//(public) 0 if this == 0, 1 if this > 0
function bnSigNum() {
if(this.s < 0) return -1;
else if(this.t <= 0 || (this.t == 1 && this.data[0] <= 0)) return 0;
else return 1;
}

//(protected) convert to radix string
function bnpToRadix(b) {
if(b == null) b = 10;
if(this.signum() == 0 || b < 2 || b > 36) return "0";
var cs = this.chunkSize(b);
var a = Math.pow(b,cs);
var d = nbv(a), y = nbi(), z = nbi(), r = "";
this.divRemTo(d,y,z);
while(y.signum() > 0) {
 r = (a+z.intValue()).toString(b).substr(1) + r;
 y.divRemTo(d,y,z);
}
return z.intValue().toString(b) + r;
}

//(protected) convert from radix string
function bnpFromRadix(s,b) {
this.fromInt(0);
if(b == null) b = 10;
var cs = this.chunkSize(b);
var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
for(var i = 0; i < s.length; ++i) {
 var x = intAt(s,i);
 if(x < 0) {
   if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
   continue;
 }
 w = b*w+x;
 if(++j >= cs) {
   this.dMultiply(d);
   this.dAddOffset(w,0);
   j = 0;
   w = 0;
 }
}
if(j > 0) {
 this.dMultiply(Math.pow(b,j));
 this.dAddOffset(w,0);
}
if(mi) BigInteger.ZERO.subTo(this,this);
}

//(protected) alternate constructor
function bnpFromNumber(a,b,c) {
if("number" == typeof b) {
 // new BigInteger(int,int,RNG)
 if(a < 2) this.fromInt(1);
 else {
   this.fromNumber(a,c);
   if(!this.testBit(a-1))  // force MSB set
     this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
   if(this.isEven()) this.dAddOffset(1,0); // force odd
   while(!this.isProbablePrime(b)) {
     this.dAddOffset(2,0);
     if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
   }
 }
}
else {
 // new BigInteger(int,RNG)
 var x = new Array(), t = a&7;
 x.length = (a>>3)+1;
 b.nextBytes(x);
 if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
 this.fromString(x,256);
}
}

//(public) convert to bigendian byte array
function bnToByteArray() {
var i = this.t, r = new Array();
r[0] = this.s;
var p = this.DB-(i*this.DB)%8, d, k = 0;
if(i-- > 0) {
 if(p < this.DB && (d = this.data[i]>>p) != (this.s&this.DM)>>p)
   r[k++] = d|(this.s<<(this.DB-p));
 while(i >= 0) {
   if(p < 8) {
     d = (this.data[i]&((1<<p)-1))<<(8-p);
     d |= this.data[--i]>>(p+=this.DB-8);
   }
   else {
     d = (this.data[i]>>(p-=8))&0xff;
     if(p <= 0) { p += this.DB; --i; }
   }
   if((d&0x80) != 0) d |= -256;
   if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
   if(k > 0 || d != this.s) r[k++] = d;
 }
}
return r;
}

function bnEquals(a) { return(this.compareTo(a)==0); }
function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

//(protected) r = this op a (bitwise)
function bnpBitwiseTo(a,op,r) {
var i, f, m = Math.min(a.t,this.t);
for(i = 0; i < m; ++i) r.data[i] = op(this.data[i],a.data[i]);
if(a.t < this.t) {
 f = a.s&this.DM;
 for(i = m; i < this.t; ++i) r.data[i] = op(this.data[i],f);
 r.t = this.t;
}
else {
 f = this.s&this.DM;
 for(i = m; i < a.t; ++i) r.data[i] = op(f,a.data[i]);
 r.t = a.t;
}
r.s = op(this.s,a.s);
r.clamp();
}

//(public) this & a
function op_and(x,y) { return x&y; }
function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

//(public) this | a
function op_or(x,y) { return x|y; }
function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

//(public) this ^ a
function op_xor(x,y) { return x^y; }
function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

//(public) this & ~a
function op_andnot(x,y) { return x&~y; }
function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

//(public) ~this
function bnNot() {
var r = nbi();
for(var i = 0; i < this.t; ++i) r.data[i] = this.DM&~this.data[i];
r.t = this.t;
r.s = ~this.s;
return r;
}

//(public) this << n
function bnShiftLeft(n) {
var r = nbi();
if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
return r;
}

//(public) this >> n
function bnShiftRight(n) {
var r = nbi();
if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
return r;
}

//return index of lowest 1-bit in x, x < 2^31
function lbit(x) {
if(x == 0) return -1;
var r = 0;
if((x&0xffff) == 0) { x >>= 16; r += 16; }
if((x&0xff) == 0) { x >>= 8; r += 8; }
if((x&0xf) == 0) { x >>= 4; r += 4; }
if((x&3) == 0) { x >>= 2; r += 2; }
if((x&1) == 0) ++r;
return r;
}

//(public) returns index of lowest 1-bit (or -1 if none)
function bnGetLowestSetBit() {
for(var i = 0; i < this.t; ++i)
 if(this.data[i] != 0) return i*this.DB+lbit(this.data[i]);
if(this.s < 0) return this.t*this.DB;
return -1;
}

//return number of 1 bits in x
function cbit(x) {
var r = 0;
while(x != 0) { x &= x-1; ++r; }
return r;
}

//(public) return number of set bits
function bnBitCount() {
var r = 0, x = this.s&this.DM;
for(var i = 0; i < this.t; ++i) r += cbit(this.data[i]^x);
return r;
}

//(public) true iff nth bit is set
function bnTestBit(n) {
var j = Math.floor(n/this.DB);
if(j >= this.t) return(this.s!=0);
return((this.data[j]&(1<<(n%this.DB)))!=0);
}

//(protected) this op (1<<n)
function bnpChangeBit(n,op) {
var r = BigInteger.ONE.shiftLeft(n);
this.bitwiseTo(r,op,r);
return r;
}

//(public) this | (1<<n)
function bnSetBit(n) { return this.changeBit(n,op_or); }

//(public) this & ~(1<<n)
function bnClearBit(n) { return this.changeBit(n,op_andnot); }

//(public) this ^ (1<<n)
function bnFlipBit(n) { return this.changeBit(n,op_xor); }

//(protected) r = this + a
function bnpAddTo(a,r) {
var i = 0, c = 0, m = Math.min(a.t,this.t);
while(i < m) {
 c += this.data[i]+a.data[i];
 r.data[i++] = c&this.DM;
 c >>= this.DB;
}
if(a.t < this.t) {
 c += a.s;
 while(i < this.t) {
   c += this.data[i];
   r.data[i++] = c&this.DM;
   c >>= this.DB;
 }
 c += this.s;
}
else {
 c += this.s;
 while(i < a.t) {
   c += a.data[i];
   r.data[i++] = c&this.DM;
   c >>= this.DB;
 }
 c += a.s;
}
r.s = (c<0)?-1:0;
if(c > 0) r.data[i++] = c;
else if(c < -1) r.data[i++] = this.DV+c;
r.t = i;
r.clamp();
}

//(public) this + a
function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

//(public) this - a
function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

//(public) this * a
function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

//(public) this / a
function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

//(public) this % a
function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

//(public) [this/a,this%a]
function bnDivideAndRemainder(a) {
var q = nbi(), r = nbi();
this.divRemTo(a,q,r);
return new Array(q,r);
}

//(protected) this *= n, this >= 0, 1 < n < DV
function bnpDMultiply(n) {
this.data[this.t] = this.am(0,n-1,this,0,0,this.t);
++this.t;
this.clamp();
}

//(protected) this += n << w words, this >= 0
function bnpDAddOffset(n,w) {
if(n == 0) return;
while(this.t <= w) this.data[this.t++] = 0;
this.data[w] += n;
while(this.data[w] >= this.DV) {
 this.data[w] -= this.DV;
 if(++w >= this.t) this.data[this.t++] = 0;
 ++this.data[w];
}
}

//A "null" reducer
function NullExp() {}
function nNop(x) { return x; }
function nMulTo(x,y,r) { x.multiplyTo(y,r); }
function nSqrTo(x,r) { x.squareTo(r); }

NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;

//(public) this^e
function bnPow(e) { return this.exp(e,new NullExp()); }

//(protected) r = lower n words of "this * a", a.t <= n
//"this" should be the larger one if appropriate.
function bnpMultiplyLowerTo(a,n,r) {
var i = Math.min(this.t+a.t,n);
r.s = 0; // assumes a,this >= 0
r.t = i;
while(i > 0) r.data[--i] = 0;
var j;
for(j = r.t-this.t; i < j; ++i) r.data[i+this.t] = this.am(0,a.data[i],r,i,0,this.t);
for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a.data[i],r,i,0,n-i);
r.clamp();
}

//(protected) r = "this * a" without lower n words, n > 0
//"this" should be the larger one if appropriate.
function bnpMultiplyUpperTo(a,n,r) {
--n;
var i = r.t = this.t+a.t-n;
r.s = 0; // assumes a,this >= 0
while(--i >= 0) r.data[i] = 0;
for(i = Math.max(n-this.t,0); i < a.t; ++i)
 r.data[this.t+i-n] = this.am(n-i,a.data[i],r,0,0,this.t+i-n);
r.clamp();
r.drShiftTo(1,r);
}

//Barrett modular reduction
function Barrett(m) {
// setup Barrett
this.r2 = nbi();
this.q3 = nbi();
BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
this.mu = this.r2.divide(m);
this.m = m;
}

function barrettConvert(x) {
if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
else if(x.compareTo(this.m) < 0) return x;
else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
}

function barrettRevert(x) { return x; }

//x = x mod m (HAC 14.42)
function barrettReduce(x) {
x.drShiftTo(this.m.t-1,this.r2);
if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
x.subTo(this.r2,x);
while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

//r = x^2 mod m; x != r
function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

//r = x*y mod m; x,y != r
function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;

//(public) this^e % m (HAC 14.85)
function bnModPow(e,m) {
var i = e.bitLength(), k, r = nbv(1), z;
if(i <= 0) return r;
else if(i < 18) k = 1;
else if(i < 48) k = 3;
else if(i < 144) k = 4;
else if(i < 768) k = 5;
else k = 6;
if(i < 8)
 z = new Classic(m);
else if(m.isEven())
 z = new Barrett(m);
else
 z = new Montgomery(m);

// precomputation
var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
g[1] = z.convert(this);
if(k > 1) {
 var g2 = nbi();
 z.sqrTo(g[1],g2);
 while(n <= km) {
   g[n] = nbi();
   z.mulTo(g2,g[n-2],g[n]);
   n += 2;
 }
}

var j = e.t-1, w, is1 = true, r2 = nbi(), t;
i = nbits(e.data[j])-1;
while(j >= 0) {
 if(i >= k1) w = (e.data[j]>>(i-k1))&km;
 else {
   w = (e.data[j]&((1<<(i+1))-1))<<(k1-i);
   if(j > 0) w |= e.data[j-1]>>(this.DB+i-k1);
 }

 n = k;
 while((w&1) == 0) { w >>= 1; --n; }
 if((i -= n) < 0) { i += this.DB; --j; }
 if(is1) {  // ret == 1, don't bother squaring or multiplying it
   g[w].copyTo(r);
   is1 = false;
 }
 else {
   while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
   if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
   z.mulTo(r2,g[w],r);
 }

 while(j >= 0 && (e.data[j]&(1<<i)) == 0) {
   z.sqrTo(r,r2); t = r; r = r2; r2 = t;
   if(--i < 0) { i = this.DB-1; --j; }
 }
}
return z.revert(r);
}

//(public) gcd(this,a) (HAC 14.54)
function bnGCD(a) {
var x = (this.s<0)?this.negate():this.clone();
var y = (a.s<0)?a.negate():a.clone();
if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
var i = x.getLowestSetBit(), g = y.getLowestSetBit();
if(g < 0) return x;
if(i < g) g = i;
if(g > 0) {
 x.rShiftTo(g,x);
 y.rShiftTo(g,y);
}
while(x.signum() > 0) {
 if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
 if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
 if(x.compareTo(y) >= 0) {
   x.subTo(y,x);
   x.rShiftTo(1,x);
 }
 else {
   y.subTo(x,y);
   y.rShiftTo(1,y);
 }
}
if(g > 0) y.lShiftTo(g,y);
return y;
}

//(protected) this % n, n < 2^26
function bnpModInt(n) {
if(n <= 0) return 0;
var d = this.DV%n, r = (this.s<0)?n-1:0;
if(this.t > 0)
 if(d == 0) r = this.data[0]%n;
 else for(var i = this.t-1; i >= 0; --i) r = (d*r+this.data[i])%n;
return r;
}

//(public) 1/this % m (HAC 14.61)
function bnModInverse(m) {
var ac = m.isEven();
if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
var u = m.clone(), v = this.clone();
var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
while(u.signum() != 0) {
 while(u.isEven()) {
   u.rShiftTo(1,u);
   if(ac) {
     if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
     a.rShiftTo(1,a);
   }
   else if(!b.isEven()) b.subTo(m,b);
   b.rShiftTo(1,b);
 }
 while(v.isEven()) {
   v.rShiftTo(1,v);
   if(ac) {
     if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
     c.rShiftTo(1,c);
   }
   else if(!d.isEven()) d.subTo(m,d);
   d.rShiftTo(1,d);
 }
 if(u.compareTo(v) >= 0) {
   u.subTo(v,u);
   if(ac) a.subTo(c,a);
   b.subTo(d,b);
 }
 else {
   v.subTo(u,v);
   if(ac) c.subTo(a,c);
   d.subTo(b,d);
 }
}
if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
if(d.compareTo(m) >= 0) return d.subtract(m);
if(d.signum() < 0) d.addTo(m,d); else return d;
if(d.signum() < 0) return d.add(m); else return d;
}

var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509];
var lplim = (1<<26)/lowprimes[lowprimes.length-1];

//(public) test primality with certainty >= 1-.5^t
function bnIsProbablePrime(t) {
var i, x = this.abs();
if(x.t == 1 && x.data[0] <= lowprimes[lowprimes.length-1]) {
 for(i = 0; i < lowprimes.length; ++i)
   if(x.data[0] == lowprimes[i]) return true;
 return false;
}
if(x.isEven()) return false;
i = 1;
while(i < lowprimes.length) {
 var m = lowprimes[i], j = i+1;
 while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
 m = x.modInt(m);
 while(i < j) if(m%lowprimes[i++] == 0) return false;
}
return x.millerRabin(t);
}

//(protected) true if probably prime (HAC 4.24, Miller-Rabin)
function bnpMillerRabin(t) {
var n1 = this.subtract(BigInteger.ONE);
var k = n1.getLowestSetBit();
if(k <= 0) return false;
var r = n1.shiftRight(k);
t = (t+1)>>1;
if(t > lowprimes.length) t = lowprimes.length;
var a = nbi();
for(var i = 0; i < t; ++i) {
 a.fromInt(lowprimes[i]);
 var y = a.modPow(r,this);
 if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
   var j = 1;
   while(j++ < k && y.compareTo(n1) != 0) {
     y = y.modPowInt(2,this);
     if(y.compareTo(BigInteger.ONE) == 0) return false;
   }
   if(y.compareTo(n1) != 0) return false;
 }
}
return true;
}

//protected
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;

//public
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

//BigInteger interfaces not implemented in jsbn:

//BigInteger(int signum, byte[] magnitude)
//double doubleValue()
//float floatValue()
//int hashCode()
//long longValue()
//static BigInteger valueOf(long val)

forge.jsbn = forge.jsbn || {};
forge.jsbn.BigInteger = BigInteger;

/**
 * util.setImmediate
 */

/* Utilities API */
var util = forge.util = forge.util || {};

// define setImmediate and nextTick
if(typeof process === 'undefined' || !process.nextTick) {
  if(typeof setImmediate === 'function') {
    util.setImmediate = setImmediate;
    util.nextTick = function(callback) {
      return setImmediate(callback);
    };
  }
  else {
    util.setImmediate = function(callback) {
      setTimeout(callback, 0);
    };
    util.nextTick = util.setImmediate;
  }
}
else {
  util.nextTick = process.nextTick;
  if(typeof setImmediate === 'function') {
    util.setImmediate = setImmediate;
  }
  else {
    util.setImmediate = util.nextTick;
  }
}

// _modPow

var _modPow = function(x, key, pub) {
  var y;

  if(pub) {
    y = x.modPow(key.e, key.n);
  }
  else {
    // pre-compute dP, dQ, and qInv if necessary
    if(!key.dP) {
      key.dP = key.d.mod(key.p.subtract(BigInteger.ONE));
    }
    if(!key.dQ) {
      key.dQ = key.d.mod(key.q.subtract(BigInteger.ONE));
    }
    if(!key.qInv) {
      key.qInv = key.q.modInverse(key.p);
    }

    /* Chinese remainder theorem (CRT) states:

      Suppose n1, n2, ..., nk are positive integers which are pairwise
      coprime (n1 and n2 have no common factors other than 1). For any
      integers x1, x2, ..., xk there exists an integer x solving the
      system of simultaneous congruences (where ~= means modularly
      congruent so a ~= b mod n means a mod n = b mod n):

      x ~= x1 mod n1
      x ~= x2 mod n2
      ...
      x ~= xk mod nk

      This system of congruences has a single simultaneous solution x
      between 0 and n - 1. Furthermore, each xk solution and x itself
      is congruent modulo the product n = n1*n2*...*nk.
      So x1 mod n = x2 mod n = xk mod n = x mod n.

      The single simultaneous solution x can be solved with the following
      equation:

      x = sum(xi*ri*si) mod n where ri = n/ni and si = ri^-1 mod ni.

      Where x is less than n, xi = x mod ni.

      For RSA we are only concerned with k = 2. The modulus n = pq, where
      p and q are coprime. The RSA decryption algorithm is:

      y = x^d mod n

      Given the above:

      x1 = x^d mod p
      r1 = n/p = q
      s1 = q^-1 mod p
      x2 = x^d mod q
      r2 = n/q = p
      s2 = p^-1 mod q

      So y = (x1r1s1 + x2r2s2) mod n
           = ((x^d mod p)q(q^-1 mod p) + (x^d mod q)p(p^-1 mod q)) mod n

      According to Fermat's Little Theorem, if the modulus P is prime,
      for any integer A not evenly divisible by P, A^(P-1) ~= 1 mod P.
      Since A is not divisible by P it follows that if:
      N ~= M mod (P - 1), then A^N mod P = A^M mod P. Therefore:

      A^N mod P = A^(M mod (P - 1)) mod P. (The latter takes less effort
      to calculate). In order to calculate x^d mod p more quickly the
      exponent d mod (p - 1) is stored in the RSA private key (the same
      is done for x^d mod q). These values are referred to as dP and dQ
      respectively. Therefore we now have:

      y = ((x^dP mod p)q(q^-1 mod p) + (x^dQ mod q)p(p^-1 mod q)) mod n

      Since we'll be reducing x^dP by modulo p (same for q) we can also
      reduce x by p (and q respectively) before hand. Therefore, let

      xp = ((x mod p)^dP mod p), and
      xq = ((x mod q)^dQ mod q), yielding:

      y = (xp*q*(q^-1 mod p) + xq*p*(p^-1 mod q)) mod n

      This can be further reduced to a simple algorithm that only
      requires 1 inverse (the q inverse is used) to be used and stored.
      The algorithm is called Garner's algorithm. If qInv is the
      inverse of q, we simply calculate:

      y = (qInv*(xp - xq) mod p) * q + xq

      However, there are two further complications. First, we need to
      ensure that xp > xq to prevent signed BigIntegers from being used
      so we add p until this is true (since we will be mod'ing with
      p anyway). Then, there is a known timing attack on algorithms
      using the CRT. To mitigate this risk, "cryptographic blinding"
      should be used (*Not yet implemented*). This requires simply
      generating a random number r between 0 and n-1 and its inverse
      and multiplying x by r^e before calculating y and then multiplying
      y by r^-1 afterwards.
    */

    // TODO: do cryptographic blinding

    // calculate xp and xq
    var xp = x.mod(key.p).modPow(key.dP, key.p);
    var xq = x.mod(key.q).modPow(key.dQ, key.q);

    // xp must be larger than xq to avoid signed bit usage
    while(xp.compareTo(xq) < 0) {
      xp = xp.add(key.p);
    }

    // do last step
    y = xp.subtract(xq)
      .multiply(key.qInv).mod(key.p)
      .multiply(key.q).add(xq);
  }

  return y;
};

/**
 * util.encodeUtf8
 */

util.encodeUtf8 = function(str) {
  return unescape(encodeURIComponent(str));
};

/**
 * util.decodeUtf8
 */

util.decodeUtf8 = function(str) {
  return decodeURIComponent(escape(str));
};


/**
 * Creates a buffer that stores bytes. A value may be given to put into the
 * buffer that is either a string of bytes or a UTF-16 string that will
 * be encoded using UTF-8 (to do the latter, specify 'utf8' as the encoding).
 *
 * @param [input] the bytes to wrap (as a string) or a UTF-16 string to encode
 *          as UTF-8.
 * @param [encoding] (default: 'raw', other: 'utf8').
 */
util.createBuffer = function(input, encoding) {
  encoding = encoding || 'raw';
  if(input !== undefined && encoding === 'utf8') {
    input = util.encodeUtf8(input);
  }
  return new util.ByteBuffer(input);
};

/**
 * util.hexToBytes
 */

util.hexToBytes = function(hex) {
  var rval = '';
  var i = 0;
  if(hex.length & 1 == 1) {
    // odd number of characters, convert first character alone
    i = 1;
    rval += String.fromCharCode(parseInt(hex[0], 16));
  }
  // convert 2 characters (1 byte) at a time
  for(; i < hex.length; i += 2) {
    rval += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return rval;
};

/**
 * pki.rsa.decrypt
 */

pki.rsa.decrypt = function(ed, key, pub, ml) {
  // get the length of the modulus in bytes
  var k = Math.ceil(key.n.bitLength() / 8);

  // error if the length of the encrypted data ED is not k
  if(ed.length != k) {
    throw {
      message: 'Encrypted message length is invalid.',
      length: ed.length,
      expected: k
    };
  }

  // convert encrypted data into a big integer
  // FIXME: hex conversion inefficient, get BigInteger w/byte strings
  var y = new BigInteger(forge.util.createBuffer(ed).toHex(), 16);

  // do RSA decryption
  var x = _modPow(y, key, pub);

  // create the encryption block, if x is shorter in bytes than k, then
  // prepend zero bytes to fill up eb
  // FIXME: hex conversion inefficient, get BigInteger w/byte strings
  var xhex = x.toString(16);
  var eb = forge.util.createBuffer();
  var zeros = k - Math.ceil(xhex.length / 2);
  while(zeros > 0) {
    eb.putByte(0x00);
    --zeros;
  }
  eb.putBytes(forge.util.hexToBytes(xhex));

  if(ml !== false) {
    /* It is an error if any of the following conditions occurs:

      1. The encryption block EB cannot be parsed unambiguously.
      2. The padding string PS consists of fewer than eight octets
        or is inconsisent with the block type BT.
      3. The decryption process is a public-key operation and the block
        type BT is not 00 or 01, or the decryption process is a
        private-key operation and the block type is not 02.
     */

    // parse the encryption block
    var first = eb.getByte();
    var bt = eb.getByte();
    if(first !== 0x00 ||
      (pub && bt !== 0x00 && bt !== 0x01) ||
      (!pub && bt != 0x02) ||
      (pub && bt === 0x00 && typeof(ml) === 'undefined')) {
      throw {
        message: 'Encryption block is invalid.'
      };
    }

    var padNum = 0;
    if(bt === 0x00) {
      // check all padding bytes for 0x00
      padNum = k - 3 - ml;
      for(var i = 0; i < padNum; ++i) {
        if(eb.getByte() !== 0x00) {
          throw {
            message: 'Encryption block is invalid.'
          };
        }
      }
    }
    else if(bt === 0x01) {
      // find the first byte that isn't 0xFF, should be after all padding
      padNum = 0;
      while(eb.length() > 1) {
        if(eb.getByte() !== 0xFF) {
          --eb.read;
          break;
        }
        ++padNum;
      }
    }
    else if(bt === 0x02) {
      // look for 0x00 byte
      padNum = 0;
      while(eb.length() > 1) {
        if(eb.getByte() === 0x00) {
          --eb.read;
          break;
        }
        ++padNum;
      }
    }

    // zero must be 0x00 and padNum must be (k - 3 - message length)
    var zero = eb.getByte();
    if(zero !== 0x00 || padNum !== (k - 3 - eb.length())) {
      throw {
        message: 'Encryption block is invalid.'
      };
    }
  }

  // return message
  return eb.getBytes();
};

/**
 * pki.rsa.encrypt
 */

pki.rsa.encrypt = function(m, key, bt) {
  var pub = bt;
  var eb = forge.util.createBuffer();

  // get the length of the modulus in bytes
  var k = Math.ceil(key.n.bitLength() / 8);

  if(bt !== false && bt !== true) {
    /* use PKCS#1 v1.5 padding */
    if(m.length > (k - 11)) {
      throw {
        message: 'Message is too long to encrypt.',
        length: m.length,
        max: (k - 11)
      };
    }

    /* A block type BT, a padding string PS, and the data D shall be
      formatted into an octet string EB, the encryption block:

      EB = 00 || BT || PS || 00 || D

      The block type BT shall be a single octet indicating the structure of
      the encryption block. For this version of the document it shall have
      value 00, 01, or 02. For a private-key operation, the block type
      shall be 00 or 01. For a public-key operation, it shall be 02.

      The padding string PS shall consist of k-3-||D|| octets. For block
      type 00, the octets shall have value 00; for block type 01, they
      shall have value FF; and for block type 02, they shall be
      pseudorandomly generated and nonzero. This makes the length of the
      encryption block EB equal to k. */

    // build the encryption block
    eb.putByte(0x00);
    eb.putByte(bt);

    // create the padding, get key type
    var padNum = k - 3 - m.length;
    var padByte;
    if(bt === 0x00 || bt === 0x01) {
      pub = false;
      padByte = (bt === 0x00) ? 0x00 : 0xFF;
      for(var i = 0; i < padNum; ++i) {
        eb.putByte(padByte);
      }
    }
    else {
      pub = true;
      for(var i = 0; i < padNum; ++i) {
        padByte = Math.floor(Math.random() * 255) + 1;
        eb.putByte(padByte);
      }
    }

    // zero followed by message
    eb.putByte(0x00);
  }

  eb.putBytes(m);

  // load encryption block as big integer 'x'
  // FIXME: hex conversion inefficient, get BigInteger w/byte strings
  var x = new BigInteger(eb.toHex(), 16);

  // do RSA encryption
  var y = _modPow(x, key, pub);

  // convert y into the encrypted data byte string, if y is shorter in
  // bytes than k, then prepend zero bytes to fill up ed
  // FIXME: hex conversion inefficient, get BigInteger w/byte strings
  var yhex = y.toString(16);
  var ed = forge.util.createBuffer();
  var zeros = k - Math.ceil(yhex.length / 2);
  while(zeros > 0) {
    ed.putByte(0x00);
    --zeros;
  }
  ed.putBytes(forge.util.hexToBytes(yhex));
  return ed.getBytes();
};

/**
 * pki.rsa.setPrivateKey
 */

pki.rsa.setPrivateKey = function(n, e, d, p, q, dP, dQ, qInv) {
  var key = {
    n: n,
    e: e,
    d: d,
    p: p,
    q: q,
    dP: dP,
    dQ: dQ,
    qInv: qInv
  };

  /**
   * Decrypts the given data with this private key.
   *
   * @param data the byte string to decrypt.
   *
   * @return the decrypted byte string.
   */
  key.decrypt = function(data) {
    return pki.rsa.decrypt(data, key, false);
  };

  /**
   * Signs the given digest, producing a signature.
   *
   * PKCS#1 supports multiple (currently two) signature schemes:
   * RSASSA-PKCS1-v1_5 and RSASSA-PSS.
   *
   * By default this implementation uses the "old scheme", i.e.
   * RSASSA-PKCS1-v1_5.  In order to generate a PSS signature, provide
   * an instance of Forge PSS object as scheme parameter.
   *
   * @param md the message digest object with the hash to sign.
   * @param scheme signature scheme to use, undefined for PKCS#1 v1.5
   *   padding style.
   * @return the signature as a byte string.
   */
  key.sign = function(md, scheme) {
    var bt = false;  /* private key operation */

    if(scheme === undefined) {
      scheme = { encode: emsaPkcs1v15encode };
      bt = 0x01;
    }

    var d = scheme.encode(md, key.n.bitLength());
    return pki.rsa.encrypt(d, key, bt);
  };

  return key;
};

/**
 * _getValueLength
 */

var _getValueLength = function(b) {
  var b2 = b.getByte();
  if(b2 == 0x80) {
    return undefined;
  }

  // see if the length is "short form" or "long form" (bit 8 set)
  var length;
  var longForm = b2 & 0x80;
  if(!longForm) {
    // length is just the first byte
    length = b2;
  }
  else {
    // the number of bytes the length is specified in bits 7 through 1
    // and each length byte is in big-endian base-256
    length = b.getInt((b2 & 0x7F) << 3);
  }
  return length;
};

/**
 * asn1
 */

/**
 * asn1.Type
 */

var asn1 = forge.asn1 = forge.asn1 || {};
asn1.Type = {
  NONE:             0,
  BOOLEAN:          1,
  INTEGER:          2,
  BITSTRING:        3,
  OCTETSTRING:      4,
  NULL:             5,
  OID:              6,
  ODESC:            7,
  EXTERNAL:         8,
  REAL:             9,
  ENUMERATED:      10,
  EMBEDDED:        11,
  UTF8:            12,
  ROID:            13,
  SEQUENCE:        16,
  SET:             17,
  PRINTABLESTRING: 19,
  IA5STRING:       22,
  UTCTIME:         23,
  GENERALIZEDTIME: 24,
  BMPSTRING:       30
};

/**
 * asn1.Class
 */

asn1.Class = {
  UNIVERSAL:        0x00,
  APPLICATION:      0x40,
  CONTEXT_SPECIFIC: 0x80,
  PRIVATE:          0xC0
};

/**
 * asn1.create
 */

asn1.create = function(tagClass, type, constructed, value) {
  /* An asn1 object has a tagClass, a type, a constructed flag, and a
    value. The value's type depends on the constructed flag. If
    constructed, it will contain a list of other asn1 objects. If not,
    it will contain the ASN.1 value as an array of bytes formatted
    according to the ASN.1 data type. */

  // remove undefined values
  if(value.constructor == Array) {
    var tmp = [];
    for(var i = 0; i < value.length; ++i) {
      if(value[i] !== undefined) {
        tmp.push(value[i]);
      }
    }
    value = tmp;
  }

  return {
    tagClass: tagClass,
    type: type,
    constructed: constructed,
    composed: constructed || (value.constructor == Array),
    value: value
  };
};

/**
 * asn1.fromDer
 */

asn1.fromDer = function(bytes) {
  // wrap in buffer if needed
  if(bytes.constructor == String) {
    bytes = forge.util.createBuffer(bytes);
  }

  // minimum length for ASN.1 DER structure is 2
  if(bytes.length() < 2)    {
    throw {
      message: 'Too few bytes to parse DER.',
      bytes: bytes.length()
    };
  }

  // get the first byte
  var b1 = bytes.getByte();

  // get the tag class
  var tagClass = (b1 & 0xC0);

  // get the type (bits 1-5)
  var type = b1 & 0x1F;

  // get the value length
  var length = _getValueLength(bytes);

  // ensure there are enough bytes to get the value
  if(bytes.length() < length) {
    throw {
      message: 'Too few bytes to read ASN.1 value.',
      detail: bytes.length() + ' < ' + length
    };
  }

  // prepare to get value
  var value;

  // constructed flag is bit 6 (32 = 0x20) of the first byte
  var constructed = ((b1 & 0x20) == 0x20);

  // determine if the value is composed of other ASN.1 objects (if its
  // constructed it will be and if its a BITSTRING it may be)
  var composed = constructed;
  if(!composed && tagClass === asn1.Class.UNIVERSAL &&
    type === asn1.Type.BITSTRING && length > 1) {
    /* The first octet gives the number of bits by which the length of the
      bit string is less than the next multiple of eight (this is called
      the "number of unused bits").

      The second and following octets give the value of the bit string
      converted to an octet string. */
    // if there are no unused bits, maybe the bitstring holds ASN.1 objs
    var read = bytes.read;
    var unused = bytes.getByte();
    if(unused === 0) {
      // if the first byte indicates UNIVERSAL or CONTEXT_SPECIFIC,
      // and the length is valid, assume we've got an ASN.1 object
      b1 = bytes.getByte();
      var tc = (b1 & 0xC0);
      if(tc === asn1.Class.UNIVERSAL ||
        tc === asn1.Class.CONTEXT_SPECIFIC) {
        try {
          var len = _getValueLength(bytes);
          composed = (len === length - (bytes.read - read));
          if(composed) {
            // adjust read/length to account for unused bits byte
            ++read;
            --length;
          }
        }
        catch(ex) {}
      }
    }
    // restore read pointer
    bytes.read = read;
  }

  if(composed) {
    // parse child asn1 objects from the value
    value = [];
    if(length === undefined) {
      // asn1 object of indefinite length, read until end tag
      for(;;) {
        if(bytes.bytes(2) === String.fromCharCode(0, 0)) {
          bytes.getBytes(2);
          break;
        }
        value.push(asn1.fromDer(bytes));
      }
    }
    else {
      // parsing asn1 object of definite length
      var start = bytes.length();
      while(length > 0) {
        value.push(asn1.fromDer(bytes));
        length -= start - bytes.length();
        start = bytes.length();
      }
    }
  }
  // asn1 not composed, get raw value
  else {
    // TODO: do DER to OID conversion and vice-versa in .toDer?

    if(length === undefined) {
      throw {
        message: 'Non-constructed ASN.1 object of indefinite length.'
      };
    }

    if(type === asn1.Type.BMPSTRING) {
      value = '';
      for(var i = 0; i < length; i += 2) {
        value += String.fromCharCode(bytes.getInt16());
      }
    }
    else {
      value = bytes.getBytes(length);
    }
  }

  // create and return asn1 object
  return asn1.create(tagClass, type, constructed, value);
};

/**
 * asn1.toDer
 */

asn1.toDer = function(obj) {
  var bytes = forge.util.createBuffer();

  // build the first byte
  var b1 = obj.tagClass | obj.type;

  // for storing the ASN.1 value
  var value = forge.util.createBuffer();

  // if composed, use each child asn1 object's DER bytes as value
  if(obj.composed) {
    // turn on 6th bit (0x20 = 32) to indicate asn1 is constructed
    // from other asn1 objects
    if(obj.constructed) {
      b1 |= 0x20;
    }
    // if type is a bit string, add unused bits of 0x00
    else {
      value.putByte(0x00);
    }

    // add all of the child DER bytes together
    for(var i = 0; i < obj.value.length; ++i) {
      if(obj.value[i] !== undefined) {
        value.putBuffer(asn1.toDer(obj.value[i]));
      }
    }
  }
  // use asn1.value directly
  else {
    if(obj.type === asn1.Type.BMPSTRING) {
      for(var i = 0; i < obj.value.length; ++i) {
        value.putInt16(obj.value.charCodeAt(i));
      }
    }
    else {
      value.putBytes(obj.value);
    }
  }

  // add tag byte
  bytes.putByte(b1);

  // use "short form" encoding
  if(value.length() <= 127) {
    // one byte describes the length
    // bit 8 = 0 and bits 7-1 = length
    bytes.putByte(value.length() & 0x7F);
  }
  // use "long form" encoding
  else {
    // 2 to 127 bytes describe the length
    // first byte: bit 8 = 1 and bits 7-1 = # of additional bytes
    // other bytes: length in base 256, big-endian
    var len = value.length();
    var lenBytes = '';
    do {
      lenBytes += String.fromCharCode(len & 0xFF);
      len = len >>> 8;
    }
    while(len > 0);

    // set first byte to # bytes used to store the length and turn on
    // bit 8 to indicate long-form length is used
    bytes.putByte(lenBytes.length | 0x80);

    // concatenate length bytes in reverse since they were generated
    // little endian and we need big endian
    for(var i = lenBytes.length - 1; i >= 0; --i) {
      bytes.putByte(lenBytes.charCodeAt(i));
    }
  }

  // concatenate value bytes
  bytes.putBuffer(value);
  return bytes;
};

/**
 * pki.rsa.setPublicKey
 */

pki.rsa.setPublicKey = function(n, e) {
  var key = {
    n: n,
    e: e
  };

  /**
   * Encrypts the given data with this public key.
   *
   * @param data the byte string to encrypt.
   *
   * @return the encrypted byte string.
   */
  key.encrypt = function(data) {
    return pki.rsa.encrypt(data, key, 0x02);
  };

  /**
   * Verifies the given signature against the given digest.
   *
   * PKCS#1 supports multiple (currently two) signature schemes:
   * RSASSA-PKCS1-v1_5 and RSASSA-PSS.
   *
   * By default this implementation uses the "old scheme", i.e.
   * RSASSA-PKCS1-v1_5, in which case once RSA-decrypted, the
   * signature is an OCTET STRING that holds a DigestInfo.
   *
   * DigestInfo ::= SEQUENCE {
   *   digestAlgorithm DigestAlgorithmIdentifier,
   *   digest Digest
   * }
   * DigestAlgorithmIdentifier ::= AlgorithmIdentifier
   * Digest ::= OCTET STRING
   *
   * To perform PSS signature verification, provide an instance
   * of Forge PSS object as scheme parameter.
   *
   * @param digest the message digest hash to compare against the signature.
   * @param signature the signature to verify.
   * @param scheme signature scheme to use, undefined for PKCS#1 v1.5
   *   padding style.
   * @return true if the signature was verified, false if not.
   */
   key.verify = function(digest, signature, scheme) {
     // do rsa decryption
     var ml = scheme === undefined ? undefined : false;
     var d = pki.rsa.decrypt(signature, key, true, ml);

     if(scheme === undefined) {
       // d is ASN.1 BER-encoded DigestInfo
       var obj = asn1.fromDer(d);

       // compare the given digest to the decrypted one
       return digest === obj.value[1].value;
     }
     else {
       return scheme.verify(digest, d, key.n.bitLength());
     }
  };

  return key;
};

/**
 * pki.rsa.stepKeyPairGenerationState
 */

var GCD_30_DELTA = [6, 4, 2, 4, 2, 4, 6, 2];

pki.rsa.stepKeyPairGenerationState = function(state, n) {
  // do key generation (based on Tom Wu's rsa.js, see jsbn.js license)
  // with some minor optimizations and designed to run in steps

  // local state vars
  var THIRTY = new BigInteger(null);
  THIRTY.fromInt(30);
  var deltaIdx = 0;
  var op_or = function(x,y) { return x|y; };

  // keep stepping until time limit is reached or done
  var t1 = +new Date();
  var t2;
  var total = 0;
  while(state.keys === null && (n <= 0 || total < n)) {
    // generate p or q
    if(state.state === 0) {
      /* Note: All primes are of the form:

        30k+i, for i < 30 and gcd(30, i)=1, where there are 8 values for i

        When we generate a random number, we always align it at 30k + 1. Each
        time the number is determined not to be prime we add to get to the
        next 'i', eg: if the number was at 30k + 1 we add 6. */
      var bits = (state.p === null) ? state.pBits : state.qBits;
      var bits1 = bits - 1;

      // get a random number
      if(state.pqState === 0) {
        state.num = new BigInteger(bits, state.rng);
        // force MSB set
        if(!state.num.testBit(bits1)) {
          state.num.bitwiseTo(
            BigInteger.ONE.shiftLeft(bits1), op_or, state.num);
        }
        // align number on 30k+1 boundary
        state.num.dAddOffset(31 - state.num.mod(THIRTY).byteValue(), 0);
        deltaIdx = 0;

        ++state.pqState;
      }
      // try to make the number a prime
      else if(state.pqState === 1) {
        // overflow, try again
        if(state.num.bitLength() > bits) {
          state.pqState = 0;
        }
        // do primality test
        else if(state.num.isProbablePrime(1)) {
          ++state.pqState;
        }
        else {
          // get next potential prime
          state.num.dAddOffset(GCD_30_DELTA[deltaIdx++ % 8], 0);
        }
      }
      // ensure number is coprime with e
      else if(state.pqState === 2) {
        state.pqState =
          (state.num.subtract(BigInteger.ONE).gcd(state.e)
          .compareTo(BigInteger.ONE) === 0) ? 3 : 0;
      }
      // ensure number is a probable prime
      else if(state.pqState === 3) {
        state.pqState = 0;
        if(state.num.isProbablePrime(10)) {
          if(state.p === null) {
            state.p = state.num;
          }
          else {
            state.q = state.num;
          }

          // advance state if both p and q are ready
          if(state.p !== null && state.q !== null) {
            ++state.state;
          }
        }
        state.num = null;
      }
    }
    // ensure p is larger than q (swap them if not)
    else if(state.state === 1) {
      if(state.p.compareTo(state.q) < 0) {
        state.num = state.p;
        state.p = state.q;
        state.q = state.num;
      }
      ++state.state;
    }
    // compute phi: (p - 1)(q - 1) (Euler's totient function)
    else if(state.state === 2) {
      state.p1 = state.p.subtract(BigInteger.ONE);
      state.q1 = state.q.subtract(BigInteger.ONE);
      state.phi = state.p1.multiply(state.q1);
      ++state.state;
    }
    // ensure e and phi are coprime
    else if(state.state === 3) {
      if(state.phi.gcd(state.e).compareTo(BigInteger.ONE) === 0) {
        // phi and e are coprime, advance
        ++state.state;
      }
      else {
        // phi and e aren't coprime, so generate a new p and q
        state.p = null;
        state.q = null;
        state.state = 0;
      }
    }
    // create n, ensure n is has the right number of bits
    else if(state.state === 4) {
      state.n = state.p.multiply(state.q);

      // ensure n is right number of bits
      if(state.n.bitLength() === state.bits) {
        // success, advance
        ++state.state;
      }
      else {
        // failed, get new q
        state.q = null;
        state.state = 0;
      }
    }
    // set keys
    else if(state.state === 5) {
      var d = state.e.modInverse(state.phi);
      state.keys = {
        privateKey: forge.pki.rsa.setPrivateKey(
          state.n, state.e, d, state.p, state.q,
          d.mod(state.p1), d.mod(state.q1),
          state.q.modInverse(state.p)),
        publicKey: forge.pki.rsa.setPublicKey(state.n, state.e)
      };
    }

    // update timing
    t2 = +new Date();
    total += t2 - t1;
    t1 = t2;
  }

  return state.keys !== null;
};

/**
 * _generateKeyPair
 */

function _generateKeyPair(state, options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }

  // web workers unavailable, use setImmediate
  if(false || typeof(Worker) === 'undefined') {
    function step() {
      // 10 ms gives 5ms of leeway for other calculations before dropping
      // below 60fps (1000/60 == 16.67), but in reality, the number will
      // likely be higher due to an 'atomic' big int modPow
      if(forge.pki.rsa.stepKeyPairGenerationState(state, 10)) {
        return callback(null, state.keys);
      }
      forge.util.setImmediate(step);
    }
    return step();
  }

  // use web workers to generate keys
  var numWorkers = options.workers || 2;
  var workLoad = options.workLoad || 100;
  var range = workLoad * 30/8;
  var workerScript = options.workerScript || 'forge/prime.worker.js';
  var THIRTY = new BigInteger(null);
  THIRTY.fromInt(30);
  var op_or = function(x,y) { return x|y; };
  generate();

  function generate() {
    // find p and then q (done in series to simplify setting worker number)
    getPrime(state.pBits, function(err, num) {
      if(err) {
        return callback(err);
      }
      state.p = num;
      getPrime(state.qBits, finish);
    });
  }

  // implement prime number generation using web workers
  function getPrime(bits, callback) {
    // TODO: consider optimizing by starting workers outside getPrime() ...
    // note that in order to clean up they will have to be made internally
    // asynchronous which may actually be slower

    // start workers immediately
    var workers = [];
    for(var i = 0; i < numWorkers; ++i) {
      // FIXME: fix path or use blob URLs
      workers[i] = new Worker(workerScript);
    }
    var running = numWorkers;

    // initialize random number
    var num = generateRandom();

    // listen for requests from workers and assign ranges to find prime
    for(var i = 0; i < numWorkers; ++i) {
      workers[i].addEventListener('message', workerMessage);
    }

    /* Note: The distribution of random numbers is unknown. Therefore, each
    web worker is continuously allocated a range of numbers to check for a
    random number until one is found.

    Every 30 numbers will be checked just 8 times, because prime numbers
    have the form:

    30k+i, for i < 30 and gcd(30, i)=1 (there are 8 values of i for this)

    Therefore, if we want a web worker to run N checks before asking for
    a new range of numbers, each range must contain N*30/8 numbers.

    For 100 checks (workLoad), this is a range of 375. */

    function generateRandom() {
      var bits1 = bits - 1;
      var num = new BigInteger(bits, state.rng);
      // force MSB set
      if(!num.testBit(bits1)) {
        num.bitwiseTo(BigInteger.ONE.shiftLeft(bits1), op_or, num);
      }
      // align number on 30k+1 boundary
      num.dAddOffset(31 - num.mod(THIRTY).byteValue(), 0);
      return num;
    }

    var found = false;
    function workerMessage(e) {
      // ignore message, prime already found
      if(found) {
        return;
      }

      --running;
      var data = e.data;
      if(data.found) {
        // terminate all workers
        for(var i = 0; i < workers.length; ++i) {
          workers[i].terminate();
        }
        found = true;
        return callback(null, new BigInteger(data.prime, 16));
      }

      // overflow, regenerate prime
      if(num.bitLength() > bits) {
        num = generateRandom();
      }

      // assign new range to check
      var hex = num.toString(16);

      // start prime search
      e.target.postMessage({
        e: state.eInt,
        hex: hex,
        workLoad: workLoad
      });

      num.dAddOffset(range, 0);
    }
  }

  function finish(err, num) {
    // set q
    state.q = num;

    // ensure p is larger than q (swap them if not)
    if(state.p.compareTo(state.q) < 0) {
      var tmp = state.p;
      state.p = state.q;
      state.q = tmp;
    }

    // compute phi: (p - 1)(q - 1) (Euler's totient function)
    state.p1 = state.p.subtract(BigInteger.ONE);
    state.q1 = state.q.subtract(BigInteger.ONE);
    state.phi = state.p1.multiply(state.q1);

    // ensure e and phi are coprime
    if(state.phi.gcd(state.e).compareTo(BigInteger.ONE) !== 0) {
      // phi and e aren't coprime, so generate a new p and q
      state.p = state.q = null;
      generate();
      return;
    }

    // create n, ensure n is has the right number of bits
    state.n = state.p.multiply(state.q);
    if(state.n.bitLength() !== state.bits) {
      // failed, get new q
      state.q = null;
      getPrime(state.qBits, finish);
      return;
    }

    // set keys
    var d = state.e.modInverse(state.phi);
    state.keys = {
      privateKey: forge.pki.rsa.setPrivateKey(
        state.n, state.e, d, state.p, state.q,
        d.mod(state.p1), d.mod(state.q1),
        state.q.modInverse(state.p)),
      publicKey: forge.pki.rsa.setPublicKey(state.n, state.e)
    };

    callback(null, state.keys);
  }
}

/**
 * pki.rsa.generateKeyPair
 */

pki.rsa.generateKeyPair = function(bits, e, options, callback) {
  // (bits), (options), (callback)
  if(arguments.length === 1) {
    if(typeof bits === 'object') {
      options = bits;
      bits = undefined;
    }
    else if(typeof bits === 'function') {
      callback = bits;
      bits = undefined;
    }
  }
  // (bits, options), (bits, callback), (options, callback)
  else if(arguments.length === 2) {
    if(typeof bits === 'number') {
      if(typeof e === 'function') {
        callback = e;
      }
      else {
        options = e;
      }
    }
    else {
      options = bits;
      callback = e;
      bits = undefined;
    }
    e = undefined;
  }
  // (bits, e, options), (bits, e, callback), (bits, options, callback)
  else if(arguments.length === 3) {
    if(typeof e === 'number') {
      if(typeof options === 'function') {
        callback = options;
        options = undefined;
      }
    }
    else {
      callback = options;
      options = e;
      e = undefined;
    }
  }
  options = options || {};
  if(bits === undefined) {
    bits = options.bits || 1024;
  }
  if(e === undefined) {
    e = options.e || 0x10001;
  }
  var state = pki.rsa.createKeyPairGenerationState(bits, e);
  if(!callback) {
    pki.rsa.stepKeyPairGenerationState(state, 0);
    return state.keys;
  }
  _generateKeyPair(state, options, callback);
};

/**
 * _bnToBytes
 */

var _bnToBytes = function(b) {
  // prepend 0x00 if first byte >= 0x80
  var hex = b.toString(16);
  if(hex[0] >= '8') {
    hex = '00' + hex;
  }
  return forge.util.hexToBytes(hex);
};

/**
 * pki.publicKeyToRSAPublicKey
 */

pki.publicKeyToRSAPublicKey = function(key) {
  // RSAPublicKey
  return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // modulus (n)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.n)),
    // publicExponent (e)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.e))
  ]);
};

/**
 * util.encode64
 */

var _base64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

util.encode64 = function(input, maxline) {
  var line = '';
  var output = '';
  var chr1, chr2, chr3;
  var i = 0;
  while(i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    // encode 4 character group
    line += _base64.charAt(chr1 >> 2);
    line += _base64.charAt(((chr1 & 3) << 4) | (chr2 >> 4));
    if(isNaN(chr2)) {
      line += '==';
    }
    else {
      line += _base64.charAt(((chr2 & 15) << 2) | (chr3 >> 6));
      line += isNaN(chr3) ? '=' : _base64.charAt(chr3 & 63);
    }

    if(maxline && line.length > maxline) {
      output += line.substr(0, maxline) + '\r\n';
      line = line.substr(maxline);
    }
  }
  output += line;

  return output;
};

/**
 * pki.publicKeyToRSAPublicKeyPem
 */

pki.publicKeyToRSAPublicKeyPem = function(key, maxline) {
  // convert to ASN.1, then DER, then base64-encode
  var out = asn1.toDer(pki.publicKeyToRSAPublicKey(key));
  out = forge.util.encode64(out.getBytes(), maxline || 64);
  return (
    '-----BEGIN RSA PUBLIC KEY-----\r\n' +
    out +
    '\r\n-----END RSA PUBLIC KEY-----');
};

/**
 * pki.privateKeyToAsn1
 */

pki.privateKeyToAsn1 = pki.privateKeyToRSAPrivateKey = function(key) {
  // RSAPrivateKey
  return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // version (0 = only 2 primes, 1 multiple primes)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      String.fromCharCode(0x00)),
    // modulus (n)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.n)),
    // publicExponent (e)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.e)),
    // privateExponent (d)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.d)),
    // privateKeyPrime1 (p)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.p)),
    // privateKeyPrime2 (q)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.q)),
    // privateKeyExponent1 (dP)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.dP)),
    // privateKeyExponent2 (dQ)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.dQ)),
    // coefficient (qInv)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.qInv))
  ]);
};

/**
 * pki.privateKeyToPem
 */

pki.privateKeyToPem = function(key, maxline) {
  // convert to ASN.1, then DER, then base64-encode
  var out = asn1.toDer(pki.privateKeyToAsn1(key));
  out = forge.util.encode64(out.getBytes(), maxline || 64);
  return (
    '-----BEGIN RSA PRIVATE KEY-----\r\n' +
    out +
    '\r\n-----END RSA PRIVATE KEY-----');
};
