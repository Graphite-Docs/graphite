##
##
## Forked from Jeff Mott's CryptoJS
##
##   https://code.google.com/p/crypto-js/
##

{X64Word,X64WordArray} = require './wordarray'
{Hasher} = require './algbase'

#=======================================================================

class Global

  @convert : (raw) -> (new X64Word(raw[i],raw[i+1]) for i in [0...raw.length] by 2)
  convert : (raw) -> Global.convert raw

  
  constructor : ->
    @K = @convert [
      0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
      0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
      0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
      0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
      0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
      0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
      0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
      0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
      0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
      0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
      0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
      0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
      0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
      0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
      0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
      0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
      0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
      0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
      0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
      0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
      0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
      0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
      0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
      0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
      0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
      0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
      0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
      0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
      0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
      0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
      0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
      0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
      0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
      0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
      0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
      0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
      0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
      0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
      0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
      0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
    ]
    @I = new X64WordArray @convert [
      0x6a09e667, 0xf3bcc908, 0xbb67ae85, 0x84caa73b,
      0x3c6ef372, 0xfe94f82b, 0xa54ff53a, 0x5f1d36f1,
      0x510e527f, 0xade682d1, 0x9b05688c, 0x2b3e6c1f,
      0x1f83d9ab, 0xfb41bd6b, 0x5be0cd19, 0x137e2179
    ]
    @W = (new X64Word(0,0) for i in [0...80])

#=======================================================================

exports.Global = Global
glbl = new Global()

#=======================================================================

exports.SHA512 = class SHA512 extends Hasher

  @blockSize : 1024/32
  blockSize : SHA512.blockSize
  @output_size : 512/8
  output_size : SHA512.output_size

  _doReset : () ->
    @_hash = glbl.I.clone()

  _doProcessBlock : (M, offset) ->
    # Shortcuts
    H = @_hash.words
    W = glbl.W

    H0 = H[0]
    H1 = H[1]
    H2 = H[2]
    H3 = H[3]
    H4 = H[4]
    H5 = H[5]
    H6 = H[6]
    H7 = H[7]
    H0h = H0.high
    H0l = H0.low
    H1h = H1.high
    H1l = H1.low
    H2h = H2.high
    H2l = H2.low
    H3h = H3.high
    H3l = H3.low
    H4h = H4.high
    H4l = H4.low
    H5h = H5.high
    H5l = H5.low
    H6h = H6.high
    H6l = H6.low
    H7h = H7.high
    H7l = H7.low

    # Working variables
    ah = H0h
    al = H0l
    bh = H1h
    bl = H1l
    ch = H2h
    cl = H2l
    dh = H3h
    dl = H3l
    eh = H4h
    el = H4l
    fh = H5h
    fl = H5l
    gh = H6h
    gl = H6l
    hh = H7h
    hl = H7l

    # Rounds
    for i in [0...80]
      # Shortcut
      Wi = W[i]

      # Extend message
      if (i < 16)
        Wih = Wi.high = M[offset + i * 2]     | 0
        Wil = Wi.low  = M[offset + i * 2 + 1] | 0
      else
        # Gamma0
        gamma0x  = W[i - 15]
        gamma0xh = gamma0x.high
        gamma0xl = gamma0x.low
        gamma0h  = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7)
        gamma0l  = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25))

        # Gamma1
        gamma1x  = W[i - 2]
        gamma1xh = gamma1x.high
        gamma1xl = gamma1x.low
        gamma1h  = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6)
        gamma1l  = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26))

        # W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
        Wi7  = W[i - 7]
        Wi7h = Wi7.high
        Wi7l = Wi7.low

        Wi16  = W[i - 16]
        Wi16h = Wi16.high
        Wi16l = Wi16.low

        Wil = gamma0l + Wi7l
        Wih = gamma0h + Wi7h + (if (Wil >>> 0) < (gamma0l >>> 0) then 1 else 0)
        Wil = Wil + gamma1l
        Wih = Wih + gamma1h + (if (Wil >>> 0) < (gamma1l >>> 0) then 1 else 0)
        Wil = Wil + Wi16l
        Wih = Wih + Wi16h + (if (Wil >>> 0) < (Wi16l >>> 0) then 1 else 0)

        Wi.high = Wih
        Wi.low  = Wil

      chh  = (eh & fh) ^ (~eh & gh)
      chl  = (el & fl) ^ (~el & gl)
      majh = (ah & bh) ^ (ah & ch) ^ (bh & ch)
      majl = (al & bl) ^ (al & cl) ^ (bl & cl)

      sigma0h = ((ah >>> 28) | (al << 4))  ^ ((ah << 30)  | (al >>> 2)) ^ ((ah << 25) | (al >>> 7))
      sigma0l = ((al >>> 28) | (ah << 4))  ^ ((al << 30)  | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7))
      sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))
      sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9))

      # t1 = h + sigma1 + ch + K[i] + W[i]
      Ki  = glbl.K[i]
      Kih = Ki.high
      Kil = Ki.low

      t1l = hl + sigma1l
      t1h = hh + sigma1h + (if (t1l >>> 0) < (hl >>> 0) then 1 else 0)
      t1l = t1l + chl
      t1h = t1h + chh + (if (t1l >>> 0) < (chl >>> 0) then 1 else 0)
      t1l = t1l + Kil
      t1h = t1h + Kih + (if (t1l >>> 0) < (Kil >>> 0) then 1 else 0)
      t1l = t1l + Wil
      t1h = t1h + Wih + (if (t1l >>> 0) < (Wil >>> 0) then 1 else 0)

      # t2 = sigma0 + maj
      t2l = sigma0l + majl
      t2h = sigma0h + majh + (if (t2l >>> 0) < (sigma0l >>> 0) then 1 else 0)

      # Update working variables
      hh = gh
      hl = gl
      gh = fh
      gl = fl
      fh = eh
      fl = el
      el = (dl + t1l) | 0
      eh = (dh + t1h + (if (el >>> 0) < (dl >>> 0) then 1 else 0)) | 0
      dh = ch
      dl = cl
      ch = bh
      cl = bl
      bh = ah
      bl = al
      al = (t1l + t2l) | 0
      ah = (t1h + t2h + (if (al >>> 0) < (t1l >>> 0) then 1 else 0)) | 0

    # Intermediate hash value
    H0l = H0.low  = (H0l + al)
    H0.high = (H0h + ah + (if (H0l >>> 0) < (al >>> 0) then 1 else 0))
    H1l = H1.low  = (H1l + bl)
    H1.high = (H1h + bh + (if (H1l >>> 0) < (bl >>> 0) then 1 else 0))
    H2l = H2.low  = (H2l + cl)
    H2.high = (H2h + ch + (if (H2l >>> 0) < (cl >>> 0) then 1 else 0))
    H3l = H3.low  = (H3l + dl)
    H3.high = (H3h + dh + (if (H3l >>> 0) < (dl >>> 0) then 1 else 0))
    H4l = H4.low  = (H4l + el)
    H4.high = (H4h + eh + (if (H4l >>> 0) < (el >>> 0) then 1 else 0))
    H5l = H5.low  = (H5l + fl)
    H5.high = (H5h + fh + (if (H5l >>> 0) < (fl >>> 0) then 1 else 0))
    H6l = H6.low  = (H6l + gl)
    H6.high = (H6h + gh + (if (H6l >>> 0) < (gl >>> 0) then 1 else 0))
    H7l = H7.low  = (H7l + hl)
    H7.high = (H7h + hh + (if (H7l >>> 0) < (hl >>> 0) then 1 else 0))
 

  _doFinalize: () ->
    # Shortcuts
    dataWords = @_data.words
    nBitsTotal = @_nDataBytes * 8
    nBitsLeft = @_data.sigBytes * 8

    # Add padding
    dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32)
    dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000)
    dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal
    @_data.sigBytes = dataWords.length * 4

    # Hash final blocks
    @_process()

    # Convert hash to 32-bit word array and return
    @_hash.toX32()

  copy_to : (obj) ->
    super obj
    obj._hash = @_hash.clone()

  clone : ->
    out = new SHA512()
    @copy_to out
    out

#=======================================================================

exports.transform = (x) ->
  out = (new SHA512).finalize x
  x.scrub()
  out
  
#=======================================================================

