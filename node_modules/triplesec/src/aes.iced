##
##
## Forked from Jeff Mott's CryptoJS
##
##   https://code.google.com/p/crypto-js/
##
{BlockCipher} = require './algbase'
{scrub_vec} = require './util'

#=======================================================================

#
# @private Global
#
# Global state used in all instances of AES, which is either
# immutable, or safe for one block only (if trampled by others).
#
#
class Global
  constructor : -> 
    @SBOX = []
    @INV_SBOX = []
    @SUB_MIX = ([] for i in [0...4])
    @INV_SUB_MIX = ([] for i in [0...4])
    @init()
    # Precomputed Rcon lookup
    @RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]

  init : () ->
    # Compute double table
    d = for i in [0...256]
      if (i < 128) then (i << 1) else ((i << 1) ^ 0x11b)

    # Walk GF(2^8)
    x = 0
    xi = 0
    for i in [0...256]
      # Compute sbox
      sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4)
      sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63
      @SBOX[x] = sx
      @INV_SBOX[sx] = x

      # Compute multiplication
      x2 = d[x]
      x4 = d[x2]
      x8 = d[x4]

      # Compute sub bytes, mix columns tables
      t = (d[sx] * 0x101) ^ (sx * 0x1010100)
      @SUB_MIX[0][x] = (t << 24) | (t >>> 8)
      @SUB_MIX[1][x] = (t << 16) | (t >>> 16)
      @SUB_MIX[2][x] = (t << 8)  | (t >>> 24)
      @SUB_MIX[3][x] = t

      # Compute inv sub bytes, inv mix columns tables
      t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100)
      @INV_SUB_MIX[0][sx] = (t << 24) | (t >>> 8)
      @INV_SUB_MIX[1][sx] = (t << 16) | (t >>> 16)
      @INV_SUB_MIX[2][sx] = (t << 8)  | (t >>> 24)
      @INV_SUB_MIX[3][sx] = t

      # Compute next counter
      if x is 0 then x = xi = 1
      else
        x = x2 ^ d[d[d[x8 ^ x2]]]
        xi ^= d[d[xi]]
    true

#=======================================================================

G = new Global()

#=======================================================================

#
# ### Advanced Encyrption Standard (AES).
#
# An implementation of standard AES, forked from 
# [Jeff Mott's CryptoJS](https://code.google.com/p/crypto-js/).
# See [Wikipedia](http://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
# for a high-level overview, and [FIPS 197](http://csrc.nist.gov/publications/fips/fips197/fips-197.pdf)
# for more information on the standard.
#
# Here, we have implemented AES-256, which takes a 256-bit key, block input
# of 128-bits, and outputs blocks of 128-bits.
#
class AES extends BlockCipher

  # Blocksize in bytes --- Each round transforms 4 32-bit
  # words, so 16 bytes in total
  @blockSize : 4*4
  blockSize : AES.blockSize 
  @keySize : 256/8
  keySize : AES.keySize
  @ivSize : AES.blockSize
  ivSize : AES.ivSize

  #-------------------------

  # 
  # Create a new AES encryption engine
  #
  # @param {WordArray} key The encryption key
  # 
  constructor : (key) ->
    @_key = key.clone()
    @_doReset()

  #-------------------------

  # @private method _doReset
  #
  # Resets the internal state of the AES cipher
  _doReset : ->
    # Shortcuts
    keyWords = @_key.words
    keySize = @_key.sigBytes / 4

    # Compute number of rounds
    @_nRounds = keySize + 6

    # Compute number of key schedule rows
    ksRows = (@_nRounds + 1) * 4

    # Compute key schedule
    @_keySchedule = []
    for ksRow in [0...ksRows]
      @_keySchedule[ksRow] = if ksRow < keySize then keyWords[ksRow]
      else 
        t = @_keySchedule[ksRow - 1]
        if (ksRow % keySize) is 0
          # Rot word
          t = (t << 8) | (t >>> 24)
          # Sub word
          t = ((G.SBOX[t >>> 24] << 24) | 
               (G.SBOX[(t >>> 16) & 0xff] << 16) | 
               (G.SBOX[(t >>> 8) & 0xff] << 8) | G.SBOX[t & 0xff])
          # Mix Rcon
          t ^= G.RCON[(ksRow / keySize) | 0] << 24
        else if (keySize > 6 && ksRow % keySize == 4)
          # Sub word
          t = ((G.SBOX[t >>> 24] << 24) | 
               (G.SBOX[(t >>> 16) & 0xff] << 16) | 
               (G.SBOX[(t >>> 8) & 0xff] << 8) | G.SBOX[t & 0xff])
        @_keySchedule[ksRow - keySize] ^ t

    # Compute inv key schedule
    @_invKeySchedule = []
    for invKsRow in [0...ksRows]
      ksRow = ksRows - invKsRow
      t = @_keySchedule[ksRow - (if (invKsRow % 4) then 0 else 4)]
      @_invKeySchedule[invKsRow] = if (invKsRow < 4 || ksRow <= 4) then t
      else (G.INV_SUB_MIX[0][G.SBOX[t >>> 24]] ^ 
            G.INV_SUB_MIX[1][G.SBOX[(t >>> 16) & 0xff]] ^
            G.INV_SUB_MIX[2][G.SBOX[(t >>> 8) & 0xff]] ^ 
            G.INV_SUB_MIX[3][G.SBOX[t & 0xff]])
    true

  #-------------------------
 
  # @method encryptBlock
  #
  # Encrypt one AES-block of input ciphertext *in place*. Replace the 
  # plaintext with the output ciphertext.  
  #
  # This is a lower-level function that should not be called directly, but only by 
  # higher-level routines.
  #
  # @param {Array<uint32>} M An array of uint32s, that can be way longer than an AES block
  # @param {Number} offset The offset into M, in # of words.
  #
  encryptBlock : (M, offset = 0) ->
    @_doCryptBlock M, offset, @_keySchedule, G.SUB_MIX, G.SBOX

  #-------------------------
 

  # @method decryptBlock
  #
  # Decrypt one AES-block of input ciphertext *in place*. Replace the 
  # ciphertext with the output plaintext.
  #
  # This is a lower-level function that should not be called directly, but only by 
  # higher-level routines.
  #
  # @param {Array<uint32>} M An array of uint32s, that can be way longer than an AES block
  # @param {Number} offset The offset into M, in # of words.
  #
  decryptBlock: (M, offset = 0) ->
    # Swap 2nd and 4th rows
    [ M[offset + 1], M[offset + 3] ] = [ M[offset + 3], M[offset + 1] ]

    @_doCryptBlock M, offset, @_invKeySchedule, G.INV_SUB_MIX, G.INV_SBOX

    # Inv swap 2nd and 4th rows
    [ M[offset + 1], M[offset + 3] ] = [ M[offset + 3], M[offset + 1] ]

  #-------------------------

  # @method scrub
  #
  # Zero-out all internal state that's sensitive.
  scrub : () ->
    scrub_vec @_keySchedule
    scrub_vec @_invKeySchedule
    @_key.scrub()

  #-------------------------
 
  # @private _doCryptBlock
  #
  # The internal workhouse of the algorithm.
  # 
  _doCryptBlock: (M, offset, keySchedule, SUB_MIX, SBOX) ->

    # Get input, add round key
    s0 = M[offset]     ^ keySchedule[0]
    s1 = M[offset + 1] ^ keySchedule[1]
    s2 = M[offset + 2] ^ keySchedule[2]
    s3 = M[offset + 3] ^ keySchedule[3]

    # Key schedule row counter
    ksRow = 4

    # Rounds
    for round in [1...@_nRounds] 
      # Shift rows, sub bytes, mix columns, add round key
      t0 = SUB_MIX[0][s0 >>> 24] ^ SUB_MIX[1][(s1 >>> 16) & 0xff] ^ SUB_MIX[2][(s2 >>> 8) & 0xff] ^ SUB_MIX[3][s3 & 0xff] ^ keySchedule[ksRow++]
      t1 = SUB_MIX[0][s1 >>> 24] ^ SUB_MIX[1][(s2 >>> 16) & 0xff] ^ SUB_MIX[2][(s3 >>> 8) & 0xff] ^ SUB_MIX[3][s0 & 0xff] ^ keySchedule[ksRow++]
      t2 = SUB_MIX[0][s2 >>> 24] ^ SUB_MIX[1][(s3 >>> 16) & 0xff] ^ SUB_MIX[2][(s0 >>> 8) & 0xff] ^ SUB_MIX[3][s1 & 0xff] ^ keySchedule[ksRow++]
      t3 = SUB_MIX[0][s3 >>> 24] ^ SUB_MIX[1][(s0 >>> 16) & 0xff] ^ SUB_MIX[2][(s1 >>> 8) & 0xff] ^ SUB_MIX[3][s2 & 0xff] ^ keySchedule[ksRow++]

      #Update state
      s0 = t0
      s1 = t1
      s2 = t2
      s3 = t3

    # Shift rows, sub bytes, add round key
    t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++]
    t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++]
    t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++]
    t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++]

    # Set output
    M[offset]     = t0
    M[offset + 1] = t1
    M[offset + 2] = t2
    M[offset + 3] = t3

#=======================================================================

exports.AES = AES

#=======================================================================
