
{HMAC_SHA256} = require './hmac'
{pbkdf2} = require './pbkdf2'
{endian_reverse,Salsa20InnerCore} = require './salsa20'
{ui8a_to_buffer,WordArray} = require './wordarray'
{fixup_uint32,default_delay,scrub_vec} = require './util'

#====================================================================

class Timer
  constructor : ->
    @tot = 0
  start : () ->
    @_t = Date.now()
  stop : () ->
    @tot += (Date.now() - @_t)

timer = new Timer()
#====================================================================

blkcpy = (D,S,d_offset,s_offset,len) -> 
  # This seemed like a good idea, but it was horrendously slow.
  #D.set(S.subarray((s_offset << 4), ((s_offset + len)) << 4), (d_offset << 4))
  j = (d_offset << 4) | 0
  i = (s_offset << 4) | 0
  end = (i + (len << 4)) | 0
  while i < end
    D[j] = S[i]
    D[j+1] = S[i+1]
    D[j+2] = S[i+2]
    D[j+3] = S[i+3]
    D[j+4] = S[i+4]
    D[j+5] = S[i+5]
    D[j+6] = S[i+6]
    D[j+7] = S[i+7]
    D[j+8] = S[i+8]
    D[j+9] = S[i+9]
    D[j+10] = S[i+10]
    D[j+11] = S[i+11]
    D[j+12] = S[i+12]
    D[j+13] = S[i+13]
    D[j+14] = S[i+14]
    D[j+15] = S[i+15]
    i += 16
    j += 16

  true

#----------

blkxor = (D,S,s_offset,len) ->
  len = (len << 4) | 0
  i = 0
  j = (s_offset << 4) | 0
  while i < len
    D[i] ^= S[j]
    D[i+1] ^= S[j+1]
    D[i+2] ^= S[j+2]
    D[i+3] ^= S[j+3]
    D[i+4] ^= S[j+4]
    D[i+5] ^= S[j+5]
    D[i+6] ^= S[j+6]
    D[i+7] ^= S[j+7]
    D[i+8] ^= S[j+8]
    D[i+9] ^= S[j+9]
    D[i+10] ^= S[j+10]
    D[i+11] ^= S[j+11]
    D[i+12] ^= S[j+12]
    D[i+13] ^= S[j+13]
    D[i+14] ^= S[j+14]
    D[i+15] ^= S[j+15]
    i += 16
    j += 16
  true 

#----------

v_endian_reverse = (v) ->
  for e,i in v
    v[i] = endian_reverse e
  true

#====================================================================

class Scrypt

  #------------

  constructor : ({N,@r,@p,c,c0,c1,@klass}) ->
    @N or= (1 << (N or 15))
    @r or= 8
    @p or= 1
    @c0 = c0 or c or 1  
    @c1 = c1 or c or 1
    @klass or= HMAC_SHA256
    @X16_tmp = new Int32Array 0x10
    @s20ic = new Salsa20InnerCore(8)

  #------------

  # @param {Uint32Array} B that is 16 words long
  salsa20_8 : (B) ->
    X = @s20ic._core B
    (B[i] += x for x,i in X)
    true

  #------------

  pbkdf2 : ({key, salt, dkLen, progress_hook, c}, cb) ->
    await pbkdf2 { key, salt, c, dkLen, @klass, progress_hook }, defer wa
    cb wa

  #------------

  blockmix_salsa8 : (B, Y) ->
    X = @X16_tmp

    # blkcpy(X, &B[(2 * r - 1) * 64], 64);
    blkcpy X,B,0,(2*@r-1), 1

    for i in [0...(2*@r)]
      # /* 3: X <-- H(X \xor B_i) */
      # blkxor(X, &B[i * 64], 64);
      blkxor X, B, i, 1
      @salsa20_8 X

      # /* 4: Y_i <-- X */
      # blkcpy(&Y[i * 64], X, 64);
      blkcpy Y, X, i, 0, 1

    # 6: B' <-- (Y_0, Y_2 ... Y_{2r-2}, Y_1, Y_3 ... Y_{2r-1}) */
    i = 0
    while (i < @r) 
      blkcpy B, Y, i, (i*2), 1
      i++
    i = 0
    while (i < @r)
      blkcpy B, Y, (i+@r), (i*2+1), 1
      i++
    true

  #------------

  # smix(B, V, XY):
  # Compute B = SMix_r(B, N).  The input B must be 128r bytes in length; the
  # temporary storage V must be 128rN bytes in length; the temporary storage
  # XY must be 256r bytes in length.  The value N must be a power of 2.
  smix : ({B, V, XY, progress_hook}, cb) ->
    X = XY
    lim = 2*@r
    Y = XY.subarray(0x10*lim)

    blkcpy X, B, 0, 0, lim

    i = 0
    while i < @N
      stop = Math.min(@N, i+2048)
      while i < stop
        # /* 3: V_i <-- X */
        blkcpy V, X, (lim*i), 0, lim

        # /* 4: X <-- H(X) */
        @blockmix_salsa8(X,Y)
        i++

      progress_hook? i
      await default_delay 0, 0, defer()

    i = 0
    while i < @N
      stop = Math.min(@N, i+256)

      while i < stop
        # This isntead of an explicit "integerify"
        j = fixup_uint32(X[0x10*(lim-1)]) & (@N - 1)

        # /* 8: X <-- H(X \xor V_j) */
        blkxor X, V, j*lim, lim
        @blockmix_salsa8 X, Y

        i++

      progress_hook? i+@N
      await default_delay 0, 0, defer()

    # /* 10: B' <-- X */
    blkcpy B, X, 0, 0, lim
    cb()

  #------------

  # Run Scrypt on the given key and salt to get dKLen of data out.
  #
  # @param {WordArray} key the Passphrase or key to work on
  # @param {WordArray} salt the random salt to prevent rainbow tables
  # @param {number} dkLen the length of data required out of the key stretcher
  # @param {callback} cb the callback to callback when done, called with a {WordArray}
  #    containing the output key material bytes.
  #
  run : ({key, salt, dkLen, progress_hook}, cb) ->
    MAX = 0xffffffff
    err = ret = null
    err = if dkLen > MAX then err = new Error "asked for too much data"
    else if @r*@p >= (1 << 30) then new Error "r & p are too big"
    else if (@r > MAX / 128 / @p) or (@r > MAX / 256) or (@N > MAX / 128 / @r) then new Error "N is too big"
    else null

    XY = new Int32Array(64*@r)
    V = new Int32Array(32*@r*@N)

    lph = (o) -> 
      o.what += " (pass 1)"
      progress_hook? o

    await @pbkdf2 { key : key.clone(), salt, dkLen : 128*@r*@p, c : @c0, progress_hook : lph }, defer B
    B = new Int32Array B.words

    v_endian_reverse B

    lph = (j) => (i) => progress_hook? {  i: (i + j*@N*2), what : "scrypt", total : @p*@N*2}
    for j in [0...@p]
      await @smix { B : B.subarray(32*@r*j), V, XY, progress_hook : lph(j) }, defer()

    v_endian_reverse B

    lph = (o) -> 
      o.what += " (pass 2)"
      progress_hook? o

    await @pbkdf2 { key, salt : WordArray.from_i32a(B), dkLen , c : @c1, progress_hook : lph }, defer out
    scrub_vec(XY)
    scrub_vec(V)
    scrub_vec(B)
    key.scrub()

    cb out

#====================================================================

# @method scrypt
#
# A convenience method to make a new Scrypt object, and then run it just
# once.
#
# @param {WordArray} key The secret/passphrase
# @param {WordArray} salt Salt to add to the intput to prevent rainbow-tables
# @param {number} r The r (memory size) parameter for scrypt [default: 8]
# @param {number} N The N (computational factor) parameter for scrypt [default : 2^10]
# @param {number} p The p (parallellism) factor for scrypt [default : 1]
# @param {number} c The number of times to run PBKDF2 [default: 1]
# @param {number} c0 The number of times to run PBKDF2 in the 0th pass [ default: 1]
# @param {number} c1 The number of times to run PBKDF2 in the 1st pass [ default: 1]
# @param {Class} klass The PRF to use as a subroutine in PBKDF2 [default : HMAC-SHA256]
# @param {function} progress_hook A Standard progress hook
# @param {number} dkLen the length of the derived key.
# @param {calllback} cb Calls back with a {WordArray} of key-material
#
scrypt = ({key, salt, r, N, p, c0, c1, c, klass, progress_hook, dkLen}, cb) ->
  eng = new Scrypt { r, N, p, c, c0, c1, klass }
  await eng.run { key, salt, progress_hook, dkLen }, defer wa
  cb wa

#====================================================================

exports.Scrypt = Scrypt
exports.scrypt = scrypt
exports.v_endian_reverse = v_endian_reverse

#====================================================================
