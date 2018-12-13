
{HMAC} = require './hmac'
{WordArray} = require './wordarray'
util = require './util'

#=========================================================

#
# Standard PBKDF2, as per RFC 2898 and/or PKCS #5 v2
# 
class PBKDF2

  # @param {WordArray} key Will be destroyed after it's used
  # @param {WordArray} salt
  # @param {Number} c the number of iterations
  # @param {Number} dkLen the needed length of output data
  # @param {Class} klass The Class of the HMAC to use. Default it is HMAC-SHA512.
  constructor : ({@klass, @c}) ->
    @c or= 1024
    @klass or= HMAC

  #-----------

  # @private @method _PRF
  # 
  # A call to the inner PRF, which is typically HMAC, and fits the HMAC APi.
  #
  # @oaram {WordArray} input The input to transform via HMAC
  #
  _PRF : (input) -> 
    @prf.reset()
    @prf.finalize input

  #-----------
 
  # @private @method _gen_T_i
  #
  # Generate one output block of key material, where the output block size is 
  # determined by the HMAC's output size.
  #
  # @param {Number} i The number of this block (start at 1 and go up..)
  # @param {Function} progress_hook A standard progress hook for the UI
  # @param {callback} cb Calls back with one block of key material.
  # 
  _gen_T_i : ({salt, i, progress_hook}, cb) ->
    progress_hook 0
    seed = salt.clone().concat new WordArray [i]
    U = @_PRF seed
    ret = U.clone()
    i = 1
    while i < @c
      stop = Math.min(@c, i + 128)
      while i < stop
        U = @_PRF U
        ret.xor U, {}
        i++
      progress_hook i
      await util.default_delay 0, 0, defer()
      null
    progress_hook i
    cb ret

  #-----------

  # @method gen
  #
  # Generate dkLen worth of key material.
  # @param {Number} dkLen The total length of the derived key material (in bytes)
  # @param {Function} progress_hook A standard progress hook for the UI
  # @param {callback} cb Calls back with a WordArray of key-material.
  #
  run : ({key, salt, dkLen, progress_hook}, cb) ->
    @prf = new @klass key
    bs = @prf.get_output_size()
    n = Math.ceil(dkLen / bs)
    words = []
    tph = null
    ph = (block) => (iter) => progress_hook? { what : "pbkdf2", total : n * @c, i : block*@c + iter }
    ph(0)(0)
    for i in [1..n]
      await @_gen_T_i {salt, i, progress_hook : ph(i-1) }, defer tmp
      words.push tmp.words
    ph(n)(0)
    flat = [].concat words...
    key.scrub()
    @prf.scrub()
    @prf = null
    cb new WordArray flat, dkLen

#=========================================================

#
# @method pbkdf2
#
# A convenience method to make a new PBKDF2 object, and then run it just
# once.
#
# @param {WordArray} key The secret key/passphrase
# @param {WordArray} salt Salt to add to the input to prevent rainbow-table attacks
# @param {number} c The number of iterations to run for
# @param {Number} dkLen The total length of the derived key material (in bytes)
# @param {Class} klass The class to use for inner HMAC, called once per iter. Default is HMAC-SHA512
# @param {callback} cb Calls back with a WordArray of key-material.
#
pbkdf2 = ({key, salt, klass, c, dkLen, progress_hook}, cb) ->
  eng = new PBKDF2 { klass, c }
  await eng.run { key, salt, dkLen, progress_hook }, defer out
  cb out

#=========================================================

exports.pbkdf2 = pbkdf2
exports.PBKDF2 = PBKDF2

