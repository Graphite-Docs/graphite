##
##
## Forked from Jeff Mott's CryptoJS
##
##   https://code.google.com/p/crypto-js/
##

{WordArray} = require './wordarray'
{Hasher} = require './algbase'

#=================================================================

class Global
  constructor : ->
    @T = ( ((Math.abs(Math.sin(i + 1)) * 0x100000000) | 0) for i in [0...64]) 

glbl = new Global()

#=================================================================

exports.MD5 = class MD5 extends Hasher
  @blockSize : 512/32
  blockSize : MD5.blockSize
  @output_size : 16 # in bytes!
  output_size : MD5.output_size

  #-------

  _doReset : () ->
    @_hash = new WordArray [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476 ]

  #-------

  _doProcessBlock : (M, offset) ->

    # Swap endian
    for i in [0...16]
      # Shortcuts
      offset_i = offset + i
      M_offset_i = M[offset_i]

      M[offset_i] = (
        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
      )

    # Shortcuts
    H = @_hash.words

    M_offset_0  = M[offset + 0]
    M_offset_1  = M[offset + 1]
    M_offset_2  = M[offset + 2]
    M_offset_3  = M[offset + 3]
    M_offset_4  = M[offset + 4]
    M_offset_5  = M[offset + 5]
    M_offset_6  = M[offset + 6]
    M_offset_7  = M[offset + 7]
    M_offset_8  = M[offset + 8]
    M_offset_9  = M[offset + 9]
    M_offset_10 = M[offset + 10]
    M_offset_11 = M[offset + 11]
    M_offset_12 = M[offset + 12]
    M_offset_13 = M[offset + 13]
    M_offset_14 = M[offset + 14]
    M_offset_15 = M[offset + 15]

    # Working varialbes
    a = H[0]
    b = H[1]
    c = H[2]
    d = H[3]

    # Computation
    a = FF(a, b, c, d, M_offset_0,  7,  glbl.T[0])
    d = FF(d, a, b, c, M_offset_1,  12, glbl.T[1])
    c = FF(c, d, a, b, M_offset_2,  17, glbl.T[2])
    b = FF(b, c, d, a, M_offset_3,  22, glbl.T[3])
    a = FF(a, b, c, d, M_offset_4,  7,  glbl.T[4])
    d = FF(d, a, b, c, M_offset_5,  12, glbl.T[5])
    c = FF(c, d, a, b, M_offset_6,  17, glbl.T[6])
    b = FF(b, c, d, a, M_offset_7,  22, glbl.T[7])
    a = FF(a, b, c, d, M_offset_8,  7,  glbl.T[8])
    d = FF(d, a, b, c, M_offset_9,  12, glbl.T[9])
    c = FF(c, d, a, b, M_offset_10, 17, glbl.T[10])
    b = FF(b, c, d, a, M_offset_11, 22, glbl.T[11])
    a = FF(a, b, c, d, M_offset_12, 7,  glbl.T[12])
    d = FF(d, a, b, c, M_offset_13, 12, glbl.T[13])
    c = FF(c, d, a, b, M_offset_14, 17, glbl.T[14])
    b = FF(b, c, d, a, M_offset_15, 22, glbl.T[15])

    a = GG(a, b, c, d, M_offset_1,  5,  glbl.T[16])
    d = GG(d, a, b, c, M_offset_6,  9,  glbl.T[17])
    c = GG(c, d, a, b, M_offset_11, 14, glbl.T[18])
    b = GG(b, c, d, a, M_offset_0,  20, glbl.T[19])
    a = GG(a, b, c, d, M_offset_5,  5,  glbl.T[20])
    d = GG(d, a, b, c, M_offset_10, 9,  glbl.T[21])
    c = GG(c, d, a, b, M_offset_15, 14, glbl.T[22])
    b = GG(b, c, d, a, M_offset_4,  20, glbl.T[23])
    a = GG(a, b, c, d, M_offset_9,  5,  glbl.T[24])
    d = GG(d, a, b, c, M_offset_14, 9,  glbl.T[25])
    c = GG(c, d, a, b, M_offset_3,  14, glbl.T[26])
    b = GG(b, c, d, a, M_offset_8,  20, glbl.T[27])
    a = GG(a, b, c, d, M_offset_13, 5,  glbl.T[28])
    d = GG(d, a, b, c, M_offset_2,  9,  glbl.T[29])
    c = GG(c, d, a, b, M_offset_7,  14, glbl.T[30])
    b = GG(b, c, d, a, M_offset_12, 20, glbl.T[31])

    a = HH(a, b, c, d, M_offset_5,  4,  glbl.T[32])
    d = HH(d, a, b, c, M_offset_8,  11, glbl.T[33])
    c = HH(c, d, a, b, M_offset_11, 16, glbl.T[34])
    b = HH(b, c, d, a, M_offset_14, 23, glbl.T[35])
    a = HH(a, b, c, d, M_offset_1,  4,  glbl.T[36])
    d = HH(d, a, b, c, M_offset_4,  11, glbl.T[37])
    c = HH(c, d, a, b, M_offset_7,  16, glbl.T[38])
    b = HH(b, c, d, a, M_offset_10, 23, glbl.T[39])
    a = HH(a, b, c, d, M_offset_13, 4,  glbl.T[40])
    d = HH(d, a, b, c, M_offset_0,  11, glbl.T[41])
    c = HH(c, d, a, b, M_offset_3,  16, glbl.T[42])
    b = HH(b, c, d, a, M_offset_6,  23, glbl.T[43])
    a = HH(a, b, c, d, M_offset_9,  4,  glbl.T[44])
    d = HH(d, a, b, c, M_offset_12, 11, glbl.T[45])
    c = HH(c, d, a, b, M_offset_15, 16, glbl.T[46])
    b = HH(b, c, d, a, M_offset_2,  23, glbl.T[47])

    a = II(a, b, c, d, M_offset_0,  6,  glbl.T[48])
    d = II(d, a, b, c, M_offset_7,  10, glbl.T[49])
    c = II(c, d, a, b, M_offset_14, 15, glbl.T[50])
    b = II(b, c, d, a, M_offset_5,  21, glbl.T[51])
    a = II(a, b, c, d, M_offset_12, 6,  glbl.T[52])
    d = II(d, a, b, c, M_offset_3,  10, glbl.T[53])
    c = II(c, d, a, b, M_offset_10, 15, glbl.T[54])
    b = II(b, c, d, a, M_offset_1,  21, glbl.T[55])
    a = II(a, b, c, d, M_offset_8,  6,  glbl.T[56])
    d = II(d, a, b, c, M_offset_15, 10, glbl.T[57])
    c = II(c, d, a, b, M_offset_6,  15, glbl.T[58])
    b = II(b, c, d, a, M_offset_13, 21, glbl.T[59])
    a = II(a, b, c, d, M_offset_4,  6,  glbl.T[60])
    d = II(d, a, b, c, M_offset_11, 10, glbl.T[61])
    c = II(c, d, a, b, M_offset_2,  15, glbl.T[62])
    b = II(b, c, d, a, M_offset_9,  21, glbl.T[63])

    # Intermediate hash value
    H[0] = (H[0] + a) | 0
    H[1] = (H[1] + b) | 0
    H[2] = (H[2] + c) | 0
    H[3] = (H[3] + d) | 0

  #----------------------------------

  _doFinalize : () ->
    # Shortcuts
    data = @_data
    dataWords = data.words

    nBitsTotal = @_nDataBytes * 8
    nBitsLeft = data.sigBytes * 8

    # Add padding
    dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32)

    nBitsTotalH = Math.floor(nBitsTotal / 0x100000000)
    nBitsTotalL = nBitsTotal
    dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
        (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
        (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
    )
    dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
        (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
        (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
    )

    data.sigBytes = (dataWords.length + 1) * 4

    # Hash final blocks
    @_process()

    # Shortcuts
    hash = @_hash
    H = hash.words

    # Swap endian
    for i in [0...4]
      H_i = H[i]
      H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) | (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00)

    return hash

  #----------------------------------

  copy_to : (obj) ->
    super obj
    obj._hash = @_hash.clone()

  #----------------------------------

  clone : ->
    out = new MD5()
    @copy_to out
    out

#=================================================================

FF = (a, b, c, d, x, s, t) ->
  n = a + ((b & c) | (~b & d)) + x + t
  return ((n << s) | (n >>> (32 - s))) + b

GG = (a, b, c, d, x, s, t) ->
  n = a + ((b & d) | (c & ~d)) + x + t
  return ((n << s) | (n >>> (32 - s))) + b

HH = (a, b, c, d, x, s, t) ->
  n = a + (b ^ c ^ d) + x + t
  return ((n << s) | (n >>> (32 - s))) + b

II = (a, b, c, d, x, s, t) ->
  n = a + (c ^ (b | ~d)) + x + t
  return ((n << s) | (n >>> (32 - s))) + b

#=================================================================

exports.transform = (x) ->
  out = (new MD5).finalize x
  x.scrub()
  out
  
#=======================================================================

