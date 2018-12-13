##
##
## Forked from Jeff Mott's CryptoJS
##
##   https://code.google.com/p/crypto-js/
##

{WordArray} = require './wordarray'
{Hasher} = require './algbase'

#=================================================================

# Reusable global
W = []

#=================================================================

class SHA1 extends Hasher
  @blockSize : 512/32
  blockSize : SHA1.blockSize
  @output_size : 20 # in bytes!
  output_size : SHA1.output_size

  #-------

  _doReset : () ->
    @_hash = new WordArray [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ]

  #-------
  
  _doProcessBlock : (M, offset) ->
    # Shortcut
    H = @_hash.words

    # Working variables
    a = H[0]
    b = H[1]
    c = H[2]
    d = H[3]
    e = H[4]

    # Computation
    for i in [0...80]
      if i < 16
        W[i] = M[offset + i] | 0
      else
        n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]
        W[i] = (n << 1) | (n >>> 31)

      t = ((a << 5) | (a >>> 27)) + e + W[i]
      if (i < 20)
        t += ((b & c) | (~b & d)) + 0x5a827999
      else if (i < 40)
        t += (b ^ c ^ d) + 0x6ed9eba1;
      else if (i < 60) 
        t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
      else # if (i < 80) 
        t += (b ^ c ^ d) - 0x359d3e2a;

      e = d
      d = c
      c = (b << 30) | (b >>> 2)
      b = a
      a = t

    # Intermediate hash value
    H[0] = (H[0] + a) | 0
    H[1] = (H[1] + b) | 0
    H[2] = (H[2] + c) | 0
    H[3] = (H[3] + d) | 0
    H[4] = (H[4] + e) | 0

  #-------

  _doFinalize : () ->
    # Shortcuts
    data = @_data
    dataWords = data.words

    nBitsTotal = @_nDataBytes * 8
    nBitsLeft = data.sigBytes * 8

    # Add padding
    dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32)
    dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000)
    dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal
    data.sigBytes = dataWords.length * 4

    # Hash final blocks
    @_process()

    # Return final computed hash
    @_hash

  #-------

  copy_to : (obj) ->
    super obj
    obj._hash = @_hash.clone()

  #-------

  clone : ->
    out = new SHA1()
    @copy_to out
    out

#=================================================================

transform = transform = (x) ->
  out = (new SHA1).finalize x
  x.scrub()
  out

#=================================================================

exports.SHA1 = SHA1
exports.transform = transform 

#=================================================================

