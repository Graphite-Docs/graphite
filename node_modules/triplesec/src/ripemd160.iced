#  @preserve
# (c) 2012 by Cédric Mesnil. All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
# 
#     - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
#     - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
# 
# Further forked from Jeff Mott's CryptoJS: https://code.google.com/p/crypto-js/source/browse/tags/3.1.2/src/ripemd160.js
# 

{WordArray,X64Word,X64WordArray} = require './wordarray'
{Hasher} = require './algbase'

#=======================================================================

class Global

  #------------------
  
  constructor : ->
    @_zl = new WordArray [
      0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
      7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
      3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
      1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
      4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13 ]
    @_zr = new WordArray [
      5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
      6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
      15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
      8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
      12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11 ]
    @_sl = new WordArray [
       11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
      7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
      11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
        11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
      9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ]
    @_sr = new WordArray [
      8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
      9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
      9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
      15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
      8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ]

    @_hl = new WordArray [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E]
    @_hr = new WordArray [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000]

#=======================================================================

G = new Global()

#=======================================================================

class RIPEMD160 extends Hasher

  # XXX I'm not sure what the block size, so there are just random guesses
  @blockSize : 512/32
  blockSize : RIPEMD160.blockSize

  #------------------

  @output_size : 160/8
  output_size : RIPEMD160.output_size

  #------------------

  _doReset : () ->
    @_hash  = new WordArray [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0]

  get_output_size : () -> @output_size

  #------------------

  _doProcessBlock: (M, offset) ->

    # Swap endian
    for i in [0...16]
      # Shortcuts
      offset_i = offset + i
      M_offset_i = M[offset_i]

      # Swap
      M[offset_i] = (
        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
      )

    # Shortcut
    H  = @_hash.words
    hl = G._hl.words
    hr = G._hr.words
    zl = G._zl.words
    zr = G._zr.words
    sl = G._sl.words
    sr = G._sr.words

    ar = al = H[0]
    br = bl = H[1]
    cr = cl = H[2]
    dr = dl = H[3]
    er = el = H[4]

    # Computation
    for i in [0...80]
      t = (al +  M[offset+zl[i]])|0
      if (i<16)
        t +=  f1(bl,cl,dl) + hl[0]
      else if (i<32) 
        t +=  f2(bl,cl,dl) + hl[1]
      else if (i<48) 
        t +=  f3(bl,cl,dl) + hl[2]
      else if (i<64) 
        t +=  f4(bl,cl,dl) + hl[3]
      else # if (i<80)
        t +=  f5(bl,cl,dl) + hl[4]

      t = t|0
      t =  rotl(t,sl[i])
      t = (t+el)|0
      al = el
      el = dl
      dl = rotl(cl, 10)
      cl = bl
      bl = t

      t = (ar + M[offset+zr[i]])|0
      if (i<16)
        t +=  f5(br,cr,dr) + hr[0]
      else if (i<32)
        t +=  f4(br,cr,dr) + hr[1]
      else if (i<48)
        t +=  f3(br,cr,dr) + hr[2]
      else if (i<64)
        t +=  f2(br,cr,dr) + hr[3]
      else # if (i<80)
        t +=  f1(br,cr,dr) + hr[4]
      t = t|0
      t =  rotl(t,sr[i]) 
      t = (t+er)|0
      ar = er
      er = dr
      dr = rotl(cr, 10)
      cr = br
      br = t

    # Intermediate hash value
    t    = (H[1] + cl + dr)|0
    H[1] = (H[2] + dl + er)|0
    H[2] = (H[3] + el + ar)|0
    H[3] = (H[4] + al + br)|0
    H[4] = (H[0] + bl + cr)|0
    H[0] =  t

  #------------------

  _doFinalize: () ->
    # Shortcuts
    data = @_data
    dataWords = data.words

    nBitsTotal = @_nDataBytes * 8
    nBitsLeft = data.sigBytes * 8

    # Add padding
    dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32)
    dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
    )
    data.sigBytes = (dataWords.length + 1) * 4

    # Hash final blocks
    @_process()

    # Shortcuts
    hash = @_hash
    H = hash.words

    # Swap endian
    for i in [0...5]
      # Shortcut
      H_i = H[i]

      # Swap
      H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
           (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00)

    # Return final computed hash
    return hash

  #------------------

  scrub : () ->
    @_hash.scrub()

  #------------------

  copy_to : (obj) ->
    super obj
    obj._hash = @_hash.clone()

  #------------------

  clone : () ->
    out = new RIPEMD160()
    @copy_to out
    return out

#======================================================================

f1 = (x, y, z) -> ((x) ^ (y) ^ (z))
f2 = (x, y, z) -> (((x)&(y)) | ((~x)&(z)))
f3 = (x, y, z) -> (((x) | (~(y))) ^ (z))
f4 = (x, y, z) -> (((x) & (z)) | ((y)&(~(z))))
f5 = (x, y, z) -> ((x) ^ ((y) |(~(z))));
rotl = (x,n) -> (x<<n) | (x>>>(32-n))

#======================================================================

transform = (x) ->
  out = (new RIPEMD160).finalize x
  x.scrub()
  out

#================================================================

exports.RIPEMD160 = RIPEMD160
exports.transform = transform

#================================================================





