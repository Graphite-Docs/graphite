#
# Copied from:
# 
#   https://gist.github.com/dchest/4582374
#   http://cr.yp.to/snuffle/salsa20/ref/salsa20.c
#
#   

{endian_reverse,WordArray} = require './wordarray'
{Counter} = require './ctr'
{fixup_uint32} = require './util'
{StreamCipher} = require './algbase'
util = require './util'

#====================================================================

asum = (out, v) -> 
  (out[i] += e for e,i in v)
  false


#====================================================================

class Salsa20InnerCore

  constructor : (@rounds) ->

  #--------------

  _core : (v) ->
    [ x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14, x15 ] = v
    
    for i in [0...@rounds] by 2
      u = (x0  + x12) | 0 ;   x4  ^= (u<<7)  | (u>>>25)
      u = (x4  + x0 ) | 0 ;   x8  ^= (u<<9)  | (u>>>23)
      u = (x8  + x4 ) | 0 ;   x12 ^= (u<<13) | (u>>>19)
      u = (x12 + x8 ) | 0 ;   x0  ^= (u<<18) | (u>>>14)
      u = (x5  + x1 ) | 0 ;   x9  ^= (u<<7)  | (u>>>25)
      u = (x9  + x5 ) | 0 ;   x13 ^= (u<<9)  | (u>>>23)
      u = (x13 + x9 ) | 0 ;   x1  ^= (u<<13) | (u>>>19)
      u = (x1  + x13) | 0 ;   x5  ^= (u<<18) | (u>>>14)
      u = (x10 + x6 ) | 0 ;   x14 ^= (u<<7)  | (u>>>25)
      u = (x14 + x10) | 0 ;   x2  ^= (u<<9)  | (u>>>23)
      u = (x2  + x14) | 0 ;   x6  ^= (u<<13) | (u>>>19)
      u = (x6  + x2 ) | 0 ;   x10 ^= (u<<18) | (u>>>14)
      u = (x15 + x11) | 0 ;   x3  ^= (u<<7)  | (u>>>25)
      u = (x3  + x15) | 0 ;   x7  ^= (u<<9)  | (u>>>23)
      u = (x7  + x3 ) | 0 ;   x11 ^= (u<<13) | (u>>>19)
      u = (x11 + x7 ) | 0 ;   x15 ^= (u<<18) | (u>>>14)
      u = (x0  + x3 ) | 0 ;   x1  ^= (u<<7)  | (u>>>25)
      u = (x1  + x0 ) | 0 ;   x2  ^= (u<<9)  | (u>>>23)
      u = (x2  + x1 ) | 0 ;   x3  ^= (u<<13) | (u>>>19)
      u = (x3  + x2 ) | 0 ;   x0  ^= (u<<18) | (u>>>14)
      u = (x5  + x4 ) | 0 ;   x6  ^= (u<<7)  | (u>>>25)
      u = (x6  + x5 ) | 0 ;   x7  ^= (u<<9)  | (u>>>23)
      u = (x7  + x6 ) | 0 ;   x4  ^= (u<<13) | (u>>>19)
      u = (x4  + x7 ) | 0 ;   x5  ^= (u<<18) | (u>>>14)
      u = (x10 + x9 ) | 0 ;   x11 ^= (u<<7)  | (u>>>25)
      u = (x11 + x10) | 0 ;   x8  ^= (u<<9)  | (u>>>23)
      u = (x8  + x11) | 0 ;   x9  ^= (u<<13) | (u>>>19)
      u = (x9  + x8 ) | 0 ;   x10 ^= (u<<18) | (u>>>14)
      u = (x15 + x14) | 0 ;   x12 ^= (u<<7)  | (u>>>25)
      u = (x12 + x15) | 0 ;   x13 ^= (u<<9)  | (u>>>23)
      u = (x13 + x12) | 0 ;   x14 ^= (u<<13) | (u>>>19)
      u = (x14 + x13) | 0 ;   x15 ^= (u<<18) | (u>>>14)

    [ x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14, x15 ]
    
#====================================================================

class Salsa20Core extends Salsa20InnerCore

  sigma : WordArray.from_buffer_le new Buffer "expand 32-byte k"
  tau : WordArray.from_buffer_le new Buffer "expand 16-byte k"

  @blockSize : 64
  blockSize : Salsa20Core.blockSize
  @keySize : 32
  keySize : Salsa20Core.keySize
  @ivSize : 192/8
  ivSize : Salsa20Core.ivSize
  
  #--------------

  constructor : (key, nonce) ->
    super 20

    # Everything in Salsa is done little endian, so we need to reverse our
    # nonces and keys at the outset.
    @key = key.clone().endian_reverse()
    @nonce = nonce.clone().endian_reverse()

    throw new Error "Bad key/nonce lengths" unless (
             ((@key.sigBytes is 16) and (@nonce.sigBytes is 8)) or
             ((@key.sigBytes is 32) and (@nonce.sigBytes in [8,24])))
    @xsalsa_setup() if @nonce.sigBytes is 24
    @input = @key_iv_setup @nonce, @key
    @_reset()

  #--------------

  scrub : () ->
    @key.scrub()
    @nonce.scrub()
    util.scrub_vec @input

  #--------------

  xsalsa_setup : () ->
    n0 = new WordArray @nonce.words[0...4]
    @nonce = n1 = new WordArray @nonce.words[4...]
    @key = @hsalsa20 n0, @key

  #--------------

  hsalsa20 : (nonce, key) ->
    input = @key_iv_setup nonce, key
    input[8] = nonce.words[2]
    input[9] = nonce.words[3]
    v = @_core input
    indexes = [ 0, 5, 10, 15, 6, 7, 8, 9]
    v = (fixup_uint32 v[i] for i in indexes)
    util.scrub_vec input
    new WordArray v

  #--------------

  key_iv_setup : (nonce, key) ->
    out = []
    for i in [0...4]
      out[i+1] = key.words[i]
    [C,A] = if key.sigBytes is 32 then [ @sigma, key.words[4...] ]
    else [ @tau, key.words ]
    for i in [0...4]
      out[i+11] = A[i]
    for i in [0...4]
      out[i*5] = C.words[i]
    out[6] = nonce.words[0]
    out[7] = nonce.words[1]
    out
   
  #--------------

  counter_setup : () ->
    @input[8] = @counter.get().words[0]
    @input[9] = @counter.get().words[1]

  #--------------

  _reset : () ->
    @counter = new Counter { len : 2 }

  #--------------

  _generateBlock : () ->
    @counter_setup()
    v = @_core @input
    asum v, @input
    @counter.inc_le()
    v


#====================================================================

exports.Salsa20WordStream = class Salsa20WordStream extends Salsa20Core

  #--------------

  _reset : () ->
    super()

  #--------------

  getWordArray : (nbytes) ->
    if not nbytes? or nbytes is @blockSize
      words = @_generateBlock()
    else 
      nblocks = Math.ceil nbytes / @blockSize
      blocks = (@_generateBlock() for i in [0...nblocks])
      words = [].concat blocks...
    for w,i in words
      words[i] = endian_reverse w
    new WordArray words, nbytes

#====================================================================

exports.Salsa20 = class Salsa20 extends Salsa20Core

  #--------------

  _reset : () ->
    super() 
    @_i = @blockSize

  #--------------

  # getBytes returns the next numberOfBytes bytes of stream.
  getBytes : (needed = @blockSize) ->
    v = []
    bsz = @blockSize

    # special-case the common-case
    if (@_i is bsz) and (needed is bsz)
      @_generateBlockBuffer()
    else
      while needed > 0
        if @_i is bsz
          @_generateBlockBuffer()
          @_i = 0
        n = Math.min needed, (bsz - @_i)
        v.push (if (n is bsz) then @_buf else @_buf[(@_i)...(@_i + n)])
        @_i += n
        needed -= n
      Buffer.concat v

  #--------------

  # _generateBlock generates 64 bytes from key, nonce, and counter,
  # and puts the result into this.block.
  _generateBlockBuffer : ->
    @_buf = new Buffer @blockSize
    v = @_generateBlock()
    for e,i in v
      @_buf.writeUInt32LE fixup_uint32(e), (i*4)
    @_buf

  #--------------

#====================================================================

exports.Cipher = class Cipher extends StreamCipher

  constructor : ( { key, iv } ) ->
    super()
    @salsa = new Salsa20WordStream key, iv
    @bsiw = @salsa.blockSize / 4 # block size in words

  scrub : () ->
    @salsa.scrub()

  get_pad : () -> 
    pad = @salsa.getWordArray()
    pad

#====================================================================

exports.encrypt = encrypt = ({key, iv, input}) ->
  cipher = new Cipher { key, iv }
  ret = cipher.encrypt input
  cipher.scrub()
  ret

#====================================================================

exports.bulk_encrypt = bulk_encrypt = ({key, iv, input, progress_hook }, cb) ->
  cipher = new Cipher { key, iv }
  await cipher.bulk_encrypt { input, progress_hook, what : "salsa20" }, defer ret
  cipher.scrub()
  cb ret

#====================================================================

exports.Salsa20InnerCore = Salsa20InnerCore
exports.endian_reverse = endian_reverse
exports.asum = asum

#====================================================================
