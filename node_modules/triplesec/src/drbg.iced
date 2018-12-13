
hmac = require './hmac'
{XOR} = require './combine'
sha512 = require './sha512'
sha3 = require './sha3'
{WordArray} = require './wordarray'
{Lock} = require 'iced-lock'

#====================================================================

#
# Implements an HMAC_DRBG (NIST SP 800-90A) based on HMAC_SHA512
# Supports security strengths up to 256 bits.
# Parameters are based on recommendations provided by Appendix D of NIST SP 800-90A.
# Implementation ported from: https://github.com/fpgaminer/python-hmac-drbg
#
class DRBG

  #-----------------

  # Seed the DRBG with sufficient entropy -- 384 bits for initial seed,
  # and 256 for a reseed.
  # 
  # @param {WordArray} entropy Initial entropy to seed the DRBG
  # @param {WordArray} personalization_string Salt
  # @param {Function} hmac_func A HMAC function to use; HMAC-SHA512 by default.
  constructor : (entropy, personalization_string, hmac_func) ->
    @hmac = hmac_func or hmac.sign
    # Only run at the most secure strength
    @security_strength = 256
    entropy = @check_entropy entropy
    personalization_string or= new WordArray []
    @_instantiate entropy, personalization_string

  #-----------------

  # @private
  #
  # Sanity check that enough entropy was provided, and puke otherwise.
  # For a reseed, we need a little bit less.
  #
  # @param {WordArray} entropy The entropy to start out with.
  # @param {bool} reseed Whether we're in reseed mode or not.
  #
  check_entropy : (entropy, reseed = false) ->
    if (entropy.sigBytes * 8 * 2) < ((if reseed then 2 else 3) * @security_strength)
      throw new Error "entropy must be at least #{1.5 * @security_strength} bits."
    entropy

  #-----------------

  #
  # @private
  #
  # Just for convenience and succinctness
  #
  _hmac : (key, input) -> @hmac { key, input }

  #-----------------

  # @private
  # 
  # Update the internal state with more entropy.
  #
  # @param {WordArray} provided_data The update.
  _update : (provided_data) ->
    V = new WordArray [0], 1
    V = V.concat provided_data if provided_data?
    V_in = @V.clone().concat(V)
    @K = @_hmac @K, V_in
    V_in.scrub()
    V.scrub()
    @V = @_hmac @K, @V

    if provided_data?
      V_in = @V.clone().concat(new WordArray [(1 << 24)], 1).concat(provided_data)
      @K = @_hmac @K, V_in
      V_in.scrub()
      @V = @_hmac @K, @V
    provided_data?.scrub()

  #-----------------

  # @private
  # 
  # Initial setup.
  #
  # @param {WordArray} entropy Initial entropy.
  # @param {WordArray} personalization_string The initial salt.
  #
  _instantiate : (entropy, personalization_string) ->
    seed_material = entropy.concat personalization_string
    n = 64
    @K = WordArray.from_buffer new Buffer (0 for i in [0...n])
    @V = WordArray.from_buffer new Buffer (1 for i in [0...n])
    @_update seed_material
    entropy.scrub()
    @reseed_counter = 1
  
  #-----------------

  # Reseed the DRBG with yet more entropy.
  # @param {WordArray} entropy The add-on entropy.
  reseed : (entropy) ->
    @_update @check_entropy(entropy,true)
    @reseed_counter = 1

  #-----------------

  # Generate bytes from the DRBG.  Upper limit is 7500/8 bytes.
  #
  # @param {number} num_bytes The number of bytes to pull out of the DRBG.
  # @return {WordArray} the random bytes
  generate : (num_bytes) ->
    throw new Error "generate cannot generate > 7500 bits in 1 call." if (num_bytes * 8) > 7500
    throw new Error "Need a reseed!" if @reseed_counter >= 10000

    tmp = []
    i = 0
    while (tmp.length is 0) or (tmp.length * tmp[0].length * 4) < num_bytes
      @V = @_hmac @K, @V
      tmp.push @V.words
    @_update()
    @reseed_counter += 1
    (new WordArray([].concat tmp...)).truncate num_bytes

#====================================================================

# ## Asynchronous DRBG
#
# This is a better interface to the DRBG, since it will politely call you
# back when it's ready, rather than impolitely throwing an exception
# if you've called it inappropriately.  This interface is recommended.
#
class ADRBG

  # @param {Function} gen_seed A function used to generate a cryptographic seed.
  # @param {Function} hmac The HMAC function to use, or HMAC-SHA512 by default.
  constructor : (@gen_seed, @hmac) ->
    @drbg = null
    @lock = new Lock()

  # Generate n bytes of random data, and callback when it's ready.
  # Calls back with a {WordArray} of random data.
  #
  # @param {number} n The number of bytes to generate.
  # @param {callback} cb The callback to fire when ready.
  generate : (n, cb) ->
    await @lock.acquire defer()
    if not @drbg?
      await @gen_seed 256, defer seed
      @drbg = new DRBG seed, null, @hmac
    if @drbg.reseed_counter > 100
      await @gen_seed 256, defer seed
      @drbg.reseed seed
    ret = @drbg.generate n
    @lock.release()
    cb ret

#====================================================================

exports.DRBG = DRBG
exports.ADRBG = ADRBG

#====================================================================
