##
##
## Forked from Jeff Mott's CryptoJS
##
##   https://code.google.com/p/crypto-js/
##

{WordArray} = require './wordarray'
{Hasher} = require './algbase'

#================================================================

class Global

  constructor : ->
    @H = []
    @K = []
    @W = []
    @init()

  isPrime : (n) ->
    return true if n in [2,3,5,7]
    return false if n in [1,4,6,8,9]
    sqn = Math.ceil Math.sqrt n
    for f in [2..sqn]
      return false if (n % f) is 0
    return true

  getFractionalBits : (n) -> ((n - (n | 0)) * 0x100000000) | 0

  init : () ->
    n = 2
    nPrime = 0
    while nPrime < 64
      if @isPrime n
        if nPrime < 8 then @H[nPrime] = @getFractionalBits(Math.pow(n, 1/2))
        @K[nPrime] = @getFractionalBits(Math.pow(n, 1/3))
        nPrime++
      n++

#================================================================

glbl = new Global()

#================================================================

class SHA256 extends Hasher

  @blockSize : 512/32
  blockSize : SHA256.blockSize
  @output_size : 256/8 # in bytes!
  output_size : SHA256.output_size

  _doReset : () ->
    @_hash = new WordArray glbl.H[0...]

  get_output_size : () -> @output_size

  _doProcessBlock: (M, offset) ->
    # Shortcut
    H = @_hash.words
    W = glbl.W
    K = glbl.K

    # Working variables
    a = H[0]
    b = H[1]
    c = H[2]
    d = H[3]
    e = H[4]
    f = H[5]
    g = H[6]
    h = H[7]

    # Computation
    for i in [0...64]
      if i < 16
        W[i] = M[offset + i] | 0
      else 
        gamma0x = W[i - 15]
        gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                ((gamma0x << 14) | (gamma0x >>> 18)) ^
                 (gamma0x >>> 3)

        gamma1x = W[i - 2]
        gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                ((gamma1x << 13) | (gamma1x >>> 19)) ^
                 (gamma1x >>> 10)

        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]

      ch  = (e & f) ^ (~e & g)
      maj = (a & b) ^ (a & c) ^ (b & c)

      sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22))
      sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25))

      t1 = h + sigma1 + ch + K[i] + W[i]
      t2 = sigma0 + maj

      h = g
      g = f
      f = e
      e = (d + t1) | 0
      d = c
      c = b
      b = a
      a = (t1 + t2) | 0

    # Intermediate hash value
    H[0] = (H[0] + a) | 0
    H[1] = (H[1] + b) | 0
    H[2] = (H[2] + c) | 0
    H[3] = (H[3] + d) | 0
    H[4] = (H[4] + e) | 0
    H[5] = (H[5] + f) | 0
    H[6] = (H[6] + g) | 0
    H[7] = (H[7] + h) | 0

  _doFinalize: () ->
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

  scrub : () ->
    @_hash.scrub()

  copy_to : (obj) ->
    super obj
    obj._hash = @_hash.clone()

  clone: () ->
    out = new SHA256()
    @copy_to out
    out

#================================================================

transform = (x) ->
  out = (new SHA256).finalize x
  x.scrub()
  out

#================================================================

exports.SHA256 = SHA256
exports.transform = transform

#================================================================

