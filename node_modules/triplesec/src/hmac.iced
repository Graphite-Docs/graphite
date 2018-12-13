{SHA512} = require './sha512'
{SHA256} = require './sha256'
util = require './util'

#=======================================================================

# Standard HMAC, which runs with SHA512 by default, but you can run it
# with other hash algoriths,
class HMAC 

  # Hard-in-fast output sizes for a 512-bit hash, either SHA-512, or 
  # SHA-3 in 512-bit mode.  This is slightly ugly, but it works for now,
  # since these are the only two we're using.
  @outputSize : 512/8
  outputSize : HMAC.outputSize

  #
  # Initializes a newly created HMAC.
  #
  # @param {WordArray} key The secret key.
  # @param {Class} klass The class of hash algorithm to use.
  #   Optional; choose SHA512 by default.
  #
  # @example
  #
  #     hmacHasher = new HMAC(key, SHA512)
  #
  constructor : (key, klass = SHA512) ->
    @key = key.clone()
    @hasher = new klass()
    @hasherBlockSize = @hasher.blockSize  # in 32-bit words
    @hasherBlockSizeBytes = @hasherBlockSize * 4 # in bytes

    # Allow arbitrary length keys
    @key = @hasher.finalize @key if @key.sigBytes > @hasherBlockSizeBytes
    @key.clamp()

    # Clone key for inner and outer pads
    @_oKey = @key.clone()
    @_iKey = @key.clone()

    # XOR keys with pad constants
    for i in [0...@hasherBlockSize]
      @_oKey.words[i] ^= 0x5c5c5c5c
      @_iKey.words[i] ^= 0x36363636
    @_oKey.sigBytes = @_iKey.sigBytes = @hasherBlockSizeBytes

    # Set initial values
    @reset()

  # @return {number} The number of bytes in the output size.
  get_output_size : () -> @hasher.output_size

  # Resets this HMAC to its initial state.
  reset : -> @hasher.reset().update @_iKey

  #
  # Updates this HMAC with a message.
  #
  # @param {WordArray} messageUpdate The message to append.
  # @return {HMAC} This HMAC instance, for chaining.
  #
  # @example
  #     hmacHasher.update(wordArray)
  #
  update : (wa) ->
    @hasher.update wa
    @

  #
  # Finalizes the HMAC computation.
  # Note that the finalize operation is effectively a destructive, read-once operation.
  #
  # @param {WordArray} messageUpdate (Optional) A final message update.
  #
  # @return {WordArray} The HMAC.
  #
  # @example
  #
  #     hmac = hmacHasher.finalize()
  #     hmac = hmacHasher.finalize(wordArray)
  #
  finalize : (wa) ->
    innerHash = @hasher.finalize wa
    @hasher.reset()
    innerHash2 = @_oKey.clone().concat innerHash
    out = @hasher.finalize innerHash2
    innerHash.scrub()
    innerHash2.scrub()
    out

  # Clean out any sensitive internal state, including our @key 
  # (which we copied on construction).
  scrub : ->
    @key.scrub()
    @_iKey.scrub()
    @_oKey.scrub()

#=======================================================================

# @method sign
# 
# A convenience method that makes a new HMAC instance, the signs, and scrubs.
#
# @param {WordArray} key The key to when signing. 
# @param {WordArray} input The input to sign.
# @param {Class} hash_class The class to use for the hasher in the HMAC ({SHA512} by default).
# @return {WordArray} The signature
sign = ({key, input, hash_class}) -> 
  eng = new HMAC key, hash_class
  out = eng.finalize(input.clamp())
  eng.scrub()
  out

#=======================================================================

#
# Sign a lot of data using the async-interface. By default use 
# HMAC-SHA512, but this function is also available to interesting
# HMAC combinations.
#
# @param {WordArray} key The secret HMAC key
# @param {WordArray} input The input to sign.
# @param {Function} progress_hook A standard progress hook (optional).
# @param {Class} klass The class to allocate for this HMAC, which is HMAC (with SHA512) by default.
# @param {String} what What to call this hasher for the sake of the progress hook.
# @param {callback} cb Callback with the generated hash, in a {WordArray}
# 
bulk_sign = ({key, input, progress_hook, klass, what}, cb) ->
  klass or= HMAC
  what or= "hmac_sha512"
  eng = new klass key
  input.clamp()
  slice_args = 
    update    : (lo,hi) -> eng.update input[lo...hi]
    finalize  : ()      -> eng.finalize()
    default_n : eng.hasherBlockSize * 1000
  await util.bulk input.sigBytes, slice_args, { what, progress_hook, cb : defer(res) }
  eng.scrub()
  cb res

#=======================================================================

exports.HMAC_SHA256 = class HMAC_SHA256 extends HMAC
  constructor : (key) -> super key, SHA256

#=======================================================================

exports.HMAC = HMAC
exports.sign = sign
exports.bulk_sign = bulk_sign

#=======================================================================

