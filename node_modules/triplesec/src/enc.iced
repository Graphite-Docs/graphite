
{WordArray}   = require './wordarray'
salsa20       = require './salsa20'
{AES}         = require './aes'
{TwoFish}     = require './twofish'
ctr           = require './ctr'
{XOR,Concat}  = require './combine'
{SHA512}      = require './sha512'
{PBKDF2}      = require './pbkdf2'
{Scrypt}      = require './scrypt'
util          = require './util'
prng          = require './prng'
{make_esc}    = require 'iced-error'
{HMAC_SHA256} = require './hmac'

#========================================================================

# @property {Object} V A lookup table of all supported versions.
V =
  "1" :
    header           : [ 0x1c94d7de, 1 ]  # The magic #, and also the version #
    salt_size        : 8                  # 8 bytes of salt is good enough!
    xsalsa20_rev     : true               # XSalsa20 Endian Reverse
    kdf              :                    # The key derivation...
      klass          : PBKDF2             #   algorithm klass
      opts           :                    #   ..and options
        c            : 1024               #   The number of iterations
        klass        : XOR                #   The HMAC to use as a subroutine
    hmac_key_size    : 768/8              # The size of the key to split over the two HMACs.
    version          : 1                  # for lookups
  "2" :
    header           : [ 0x1c94d7de, 2 ]  # The magic #, and also the version #
    salt_size        : 16                 # 16 bytes of salt for various uses
    xsalsa20_rev     : true               # XSalsa20 Endian Reverse
    kdf              :                    # The key derivation...
      klass          : Scrypt             #   algorithm klass
      opts           :                    #   ..and options
        c            : 64                 #   The number of iterations
        klass        : XOR                #   The HMAC to use as a subroutine
        N            : 12                 #   log_2 of the work factor
        r            : 8                  #   The memory use factor
        p            : 1                  #   the parallelization factor
    hmac_key_size    : 768/8              # The size of the key to split over the two HMACs.
    version          : 2                  # for lookups
  "3" :
    header           : [ 0x1c94d7de, 3 ]  # The magic #, and also the version #
    salt_size        : 16                 # 16 bytes of salt for various uses
    xsalsa20_rev     : false              # XSalsa20 Endian Reverse
    kdf              :                    # The key derivation...
      klass          : Scrypt             #   algorithm klass
      opts           :                    #   ..and options
        c            : 1                  #   The number of iterations
        klass        : HMAC_SHA256        #   The HMAC to use as a subroutine
        N            : 15                 #   log_2 of the work factor
        r            : 8                  #   The memory use factor
        p            : 1                  #   the parallelization factor
    hmac_key_size    : 768/8              # The size of the key to split over the two HMACs.
    version          : 3                  # for lookups

#========================================================================

exports.CURRENT_VERSION = CURRENT_VERSION = 3

#========================================================================

# A base class for the {Encryptor} and {Decryptor} classes.
# Handles a lot of the particulars of signing, key generation,
# and encryption/decryption.
class Base

  #---------------

  # @param {WordArray} key The private encryption key
  constructor : ( { key, version } ) ->
    @version = V[if version? then version else CURRENT_VERSION]
    throw new Error "unknown version: #{version}" unless @version?

    @set_key key

    # A map from Salt -> KeySets
    @derived_keys = {}

  #---------------

  # @method kdf
  #
  # Run the KDF function specified by our current version,
  # to yield the encryption and signing keys, given the
  # input `key` and the randomly-generated salt.
  #
  # @param {WordArray} salt The salt to use for key generation.
  # @param {Function} progress_hook A standard progress hook (optional).
  # @param {callback} cb Callback with an {Object} after completion.
  #   The object will map cipher-name to a {WordArray} that is the generated key.
  #
  kdf : ({salt, extra_keymaterial, progress_hook}, cb) ->

    await @_check_scrubbed @key, "in KDF", cb, defer()

    # Check the cache first
    salt_hex = salt.to_hex()

    # The key gets scrubbed by pbkdf2, so we need to clone our copy of it.
    key = @key.clone()

    await @_check_scrubbed key, "KDF", cb, defer()

    if not (keys = @derived_keys[salt_hex])?
      @_kdf = new @version.kdf.klass @version.kdf.opts

      lens =
        hmac    : @version.hmac_key_size
        aes     : AES.keySize
        twofish : TwoFish.keySize
        salsa20 : salsa20.Salsa20.keySize

      # The order to read the keys out of the Scrypt output, and don't
      # depend on the properties of the hash to guarantee the order.
      order = [ 'hmac', 'aes', 'twofish', 'salsa20' ]

      dkLen = extra_keymaterial or 0
      (dkLen += v for k,v of lens)

      args = {dkLen, key, progress_hook, salt }
      await @_kdf.run args, defer raw
      keys = {}
      i = 0
      for k in order
        v = lens[k]
        len = v/4
        end = i + len
        keys[k] = new WordArray raw.words[i...end]
        i = end
      keys.extra = (new WordArray raw.words[end...]).to_buffer()
      @derived_keys[salt_hex] = keys

    cb null, keys

  #---------------

  # Set or change the key on this encryptor, causing a scrubbing of the
  # old state if it was previously set.
  #
  # @param {Buffer} key the Passphrase/key as a standard buffer object.
  #
  set_key : (key) ->
    if key?
      wakey = WordArray.from_buffer(key)
      if not @key or not @key.equal wakey
        @scrub()
        @key = wakey
    else
      @scrub()

  #---------------

  # @private
  #
  # Check that a key isn't scrubbed. If it is, it's a huge problem, and we should short-circuit
  # encryption.
  #
  # @param {WordArray} key The key to check for having been scrubbed.
  # @param {String} where Where the check is happening.
  # @param {callback} ecb The callback to fire with an Error, in the case of a scrubbed key.
  # @param {callback} okcb The callback to fire if we're OK to proceed.
  #
  _check_scrubbed : (key, where, ecb, okcb) ->
    if key? and not key.is_scrubbed() then okcb()
    else ecb (new Error "#{where}: Failed due to scrubbed key!"), null

  #---------------

  # Sign with HMAC-SHA512-SHA-3
  #
  # @param {WordArray} input The text to sign.
  # @param {WordArray} key The signing key
  # @param {WordArray} salt The salt used to generate the derived keys.
  # @param {Function} progress_hook A standard progress hook (optional).
  # @param {callback} cb Call back with `(err,res)` upon completion,
  #   with `res` of type {WordArray} and containing the signature.
  #
  sign : ({input, key, salt, progress_hook}, cb) ->
    await @_check_scrubbed key, "HMAC", cb, defer()
    input = (new WordArray @version.header ).concat(salt).concat(input)
    await Concat.bulk_sign { key, input, progress_hook}, defer(out)
    input.scrub()
    cb null, out

  #---------------

  # Run SALSA20, output (IV || ciphertext)
  #
  # @param {WordArray} input The input plaintext
  # @param {WordArray} key The Salsa20-specific encryption key (32 bytes)
  # @param {WordArray} iv The Salsa20-specific IV (24 bytes as per XSalsa20)
  # @param {bool} output_iv Whether or not to output the IV with the ciphertext
  # @param {callback} cb Callback on completion with `(err, res)`.  `res` will
  #   be a {WordArray} of the ciphertext or a concatenation of the IV and
  #   the ciphertext, depending on the `output_iv` option.
  run_salsa20 : ({ input, key, iv, output_iv, progress_hook }, cb) ->
    await @_check_scrubbed key, "Salsa20", cb, defer()

    args = { input, progress_hook, key, iv }

    # In the newer versions of TripleSec, we fix the fact that our
    # inputs to Xsalsa20 were reversed endianwise.  It wasn't a security
    # bug, it was just wrong.  This fixes it going forward.  We might
    # want a slightly cleaner fix by the way...
    if @version.xsalsa20_rev
      args.key = key.clone().endian_reverse()
      args.iv = iv.clone().endian_reverse()

    await salsa20.bulk_encrypt args, defer ct

    # Despite the reversals, always output the original IV.
    ct = iv.clone().concat(ct) if output_iv

    # Scrub the reversed IV & key since we'll never use it again.
    if @version.xsalsa20_rev
      args.key.scrub()
      args.iv.scrub()

    cb null, ct

  #---------------

  # Run Twofish, output (IV || ciphertext).
  #
  # @param {WordArray} input The input plaintext
  # @param {WordArray} key The Twofish-specific encryption key (32 bytes)
  # @param {WordArray} iv The Twofish-specific IV (16 bytes)
  # @param {callback} cb Callback on completion with `(err, res)`.  `res` will
  #   be a {WordArray} of the concatenation of the IV and
  #   the ciphertext.
  run_twofish : ({input, key, iv, progress_hook}, cb) ->
    await @_check_scrubbed key, "TwoFish", cb, defer()
    block_cipher = new TwoFish key
    await ctr.bulk_encrypt { block_cipher, iv, input, progress_hook, what : "twofish" }, defer ct
    block_cipher.scrub()
    cb null, iv.clone().concat(ct)

  #---------------

  # Run AES, output (IV || ciphertext).
  #
  # @param {WordArray} input The input plaintext
  # @param {WordArray} key The AES-specific encryption key (32 bytes)
  # @param {WordArray} iv The AES-specific IV (16 bytes)
  # @param {callback} cb Callback on completion with `(err, res)`.  `res` will
  #   be a {WordArray} of the concatenation of the IV and
  #   the ciphertext.
  run_aes : ({input, key, iv, progress_hook}, cb) ->
    await @_check_scrubbed key, "AES", cb, defer()
    block_cipher = new AES key
    await ctr.bulk_encrypt { block_cipher, iv, input, progress_hook, what : "aes" }, defer ct
    block_cipher.scrub()
    cb null, iv.clone().concat(ct)

  #---------------

  # Scrub all internal state that may be sensitive.  Use it after you're done
  # with the Encryptor.
  scrub : () ->
    @key.scrub() if @key?
    if @derived_keys?
      for salt,key_ring of @derived_keys

        # MK 2015-08-27
        # This is somewhat of a bug, but we never sucessfully scrubbed these
        # extra keymaterial bytes beforehand, and applications now depend on it.
        for algo,key of key_ring when algo isnt 'extra'
            key.scrub()

    @derived_keys = {}
    @salt.scrub() if @salt?
    @salt = null
    @key = null

  #---------------

  # Clone a copy that can survive a scrubbing
  #
  clone_derived_keys : () ->
    ret = null
    if @derived_keys?
      ret = {}
      for salt,key_ring of @derived_keys
        ret[salt] = {}
        for algo,key of key_ring
          # Let's just pass a reference to the extra key material,
          # since it's a buffer that we don't scrub() above.
          ret[salt][algo] = if (algo is 'extra') then key else key.clone()
    ret

#========================================================================

# ### Encryptor
#
# The high-level Encryption engine for TripleSec.  You should allocate one
# instance of this object for each secret key you are dealing with.  Reusing
# the same Encryptor object will allow you to avoid rerunning PBKDF2 with
# each encryption.  If you want to use new salt with every encryption,
# you can call `resalt` as needed.   The `run` method is called to
# run the encryption engine.
#
# Here is an example of multiple encryptions with salt reuse, in CoffeeScript:
# @example
# ```coffeescript
# key = new Buffer "pitying web andiron impacts bought"
# data = new Buffer "this is my secret data"
# eng = new Encryptor { key }
# eng.run { data }, (err, res) ->
#    console.log "Ciphertext 1: " + res.toString('hex')
#    data = Buffer.concat data, new Buffer " which just got bigger"
#    eng.run { data }, (err, res) ->
#      console.log "Ciphertext 2: " + res.toString('hex')
#```
#
# Or equivalently in JavaScript:
# @example
# ```javascript
# var key = new Buffer("pitying web andiron impacts bought");
# var data = new Buffer("this is my secret data");
# var eng = new Encryptor({ key : key });
# eng.run({ data : data }, function (err, res) {
#    console.log("Ciphertext 1: " + res.toString('hex'));
#    data = Buffer.concat(data, new Buffer(" which just got bigger"));
#    eng.run({ data : data }), function (err, res) {
#      console.log("Ciphertext 2: " + res.toString('hex'));
#    });
# });
# ```
#
# In the previous two examples, the same salt was used for both ciphertexts.
# To resalt (and regenerate encryption keys):
# @example
# ```coffeescript
# key = new Buffer "pitying web andiron impacts bought"
# data = new Buffer "this is my secret data"
# eng = new Encryptor { key }
# eng.run { data }, (err, res) ->
#    console.log "Ciphertext 1: " + res.toString('hex')
#    data = Buffer.concat data, new Buffer " which just got bigger"
#    eng.resalt {}, () ->
#      eng.run { data }, (err, res) ->
#        console.log "Ciphertext 2: " + res.toString('hex')
#```
#
#
class Encryptor extends Base

  #---------------

  # @param {Buffer} key The secret key
  # @param {Function} rng Call it with the number of Rando bytes you need. It should callback with a WordArray of random bytes
  # @param {Object} version The version object to follow
  constructor : ( { key, rng, version } ) ->
    super { key, version }
    @rng = rng or prng.generate

  #---------------

  # @private
  #
  # Pick random IVS, one for each crypto algoritm. Call back
  # with an Object, mapping cipher engine name to a {WordArray}
  # containing the IV.
  #
  # @param {Function} progress_hook A standard progress hook.
  # @param {callback} cb Called back when the resalting completes.
  pick_random_ivs : ({progress_hook}, cb) ->
    iv_lens =
      aes : AES.ivSize
      twofish : TwoFish.ivSize
      salsa20 : salsa20.Salsa20.ivSize
    ivs = {}
    for k,v of iv_lens
      await @rng v, defer ivs[k]
    cb ivs

  #---------------

  # Regenerate the salt. Reinitialize the keys. You have to do this
  # once, but if you don't do it again, you'll just wind up using the
  # same salt.
  #
  # @param {Function} progress_hook A standard progress hook.
  # @param {Buffer} salt The optional salt to provide, if it's deterministic
  #     and can be passed in.  If not provided, then we
  # @param {callback} cb Called back when the resalting completes.
  resalt : ({salt, extra_keymaterial, progress_hook}, cb) ->
    err = null
    if not salt?
      await @rng @version.salt_size, defer @salt
    else if salt.length isnt @version.salt_size
      err = new Error "Need a salt of exactly #{@version.salt_size} bytes (got #{salt.length})"
    else
      @salt = WordArray.alloc salt
    unless err?
      await @kdf {extra_keymaterial, progress_hook, @salt}, defer err, @keys
    cb err, @keys

  #---------------

  # @method run
  #
  # The main point of entry into the TripleSec Encryption system.  The
  # steps of the algorithm are:
  #
  #  1. Encrypt PT with Salsa20
  #  1. Encrypt the result of 1 with 2Fish-256-CTR
  #  1. Encrypt the result of 2 with AES-256-CTR
  #  1. MAC with (HMAC-SHA512 || HMAC-SHA3)
  #
  # @param {Buffer} data the data to encrypt
  # @param {Buffer} salt The optional salt to provide, if it's deterministic
  #     and can be passed in.  If not provided, then we
  # @param {Function} progress_hook Call this to update the U/I about progress
  # @param {number} extra_keymaterial The number of extra bytes to generate
  #    along with the crypto keys (default : 0)
  # @param {callback} cb With an (err,res) pair, res is the buffer with the encrypted data
  #
  run : ( { data, salt, extra_keymaterial, progress_hook }, cb ) ->

    # esc = "Error Short-Circuiter".  In the case of an error,
    # we'll forget about the rest of the function and just call back
    # the outer-level cb with the error.  If no error, then proceed as normal.
    esc = make_esc cb, "Encryptor::run"

    if salt? or not @salt?
      await @resalt { salt, extra_keymaterial, progress_hook }, esc defer()
    await @pick_random_ivs { progress_hook }, defer ivs
    pt   = WordArray.from_buffer data
    await @run_salsa20 { input : pt,  key : @keys.salsa20, progress_hook, iv : ivs.salsa20, output_iv : true }, esc defer ct1
    await @run_twofish { input : ct1, key : @keys.twofish, progress_hook, iv : ivs.twofish }, esc defer ct2
    await @run_aes     { input : ct2, key : @keys.aes,     progress_hook, iv : ivs.aes     }, esc defer ct3
    await @sign        { input : ct3, key : @keys.hmac,    progress_hook, @salt            }, esc defer sig
    ret = (new WordArray(@version.header)).concat(@salt).concat(sig).concat(ct3).to_buffer()
    util.scrub_buffer data
    cb null, ret


  #
  # @method clone
  #
  # Clone a copy of this object that can survive scrubbing
  #
  clone : () ->
    ret = new Encryptor { key : @key?.to_buffer(), @rng, version : @version?.version }
    ret.derived_keys = @clone_derived_keys()
    ret

#========================================================================

#
# @method encrypt
#
# A convenience wrapper for:
#
# 1. Creating a new Encryptor instance with the given key
# 1. Calling `run` just once.
# 1. Scrubbing and deleting all state.
#
# @param {Buffer} key The secret key.  This data is scrubbed after use, so copy it
#   if you want to keep track of it.
# @param {Buffer} data The data to encrypt.  Again, this data is scrubber after
#   use, so copy it if you need it later.
# @param {Function} rng A function that takes as input n and outputs n truly
#   random bytes.  You must give a real RNG here and not something fake.
#   You can try require('./prng').generate_words for starters.
# @param {callback} cb Callback with an (err,res) pair. The err is an Error object
#   (if encountered), and res is a Buffer object (on success).
#
encrypt = ({ key, data, rng, progress_hook, version}, cb) ->
  enc = new Encryptor { key, rng, version }
  await enc.run { data, progress_hook }, defer err, ret
  enc.scrub()
  cb err, ret

#========================================================================

exports.V = V
exports.encrypt = encrypt
exports.Base = Base
exports.Encryptor = Encryptor

#========================================================================
