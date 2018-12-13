{HMAC,bulk_sign} = require './hmac'
{SHA512} = require './sha512'
{SHA3} = require './sha3'
{WordArray} = require './wordarray'

#=============================================

# A base class for HMAC-combiners.
class CombineBase

  # Construct a new HMAC-combiner
  #
  constructor : () ->
    @hasherBlockSize = @hashers[0].hasherBlockSize
    @hasherBlockSizeBytes = @hasherBlockSize * 4
    @reset()

  # Reset the inner hashers, thereby resetting the combined HMAC.
  # @return {CombineBase} Return `this` for chaining.
  reset : ->
    (h.reset() for h in @hashers)
    @

  # Update both hashers with the given input
  # @param {WordArray} w The input to the update
  # @return {CombineBase} Return `this` for chaining.
  update : (w) ->
    (h.update(w) for h in @hashers)
    @

  # Scrub all internal state (including the keys) of both HMACs.
  # @return {CombineBase} Return `this` for chaining.
  scrub : () ->
    (h.scrub() for h in @hashers)
    @

  # Finalize the cominbed hashers, and do the actual combining.
  # @param {WordArray} w The input to the update
  # @return {CombineBase} Return `this` for chaining.
  finalize : (w) ->
    hashes = (h.finalize(w) for h in @hashers)
    out = hashes[0]
    for h in hashes[1...]
      @_coalesce out, h
      h.scrub()
    out

#=============================================

# The concatenation HMAC combiner. Good when you are shooting for
# collision-resistance.
class Concat extends CombineBase

  # Construct a new Concat-combiner
  #
  # @param {WordArray} key The key to use, split up over the klasses
  # @param {Vector<Class>} klasses The classes to combine.
  constructor : (key, klasses = [ SHA512, SHA3 ] ) ->
    subkeys = key.split(klasses.length)
    @hashers = for klass,i in klasses 
      subkey = subkeys[i]
      hm = new HMAC(subkey, klass)
      subkey.scrub()
      hm
    super()

  # The default output size if you use the default arguments,
  # which is HMAC(SHA512) || HMAC(SHA3).
  @get_output_size : () -> SHA512.output_size + SHA3.output_size

  # @private _coalesce
  # 
  # Combine the output of the temporary h into the accumulator out via concat
  # @param {WordArray} out The targe accumulator
  # @param {WordArray} h The input HMAC to be combined.
  #
  _coalesce : (out, h) -> 
    out.concat h

  # Gets the output size of this combination, which can only be known
  # once this Combiner has been allocated.  Call this if you're not
  # using the default Class parameters (SHA512 + SHA3).
  # @return {Number} The output size in bytes.
  get_output_size : () -> 
    tot = 0
    (tot += h.get_output_size() for h in @hashers)
    tot

  # Sign an input with the given key using this technique.
  # @param {WordArray} key The key to sign with.
  # @param {WordArray} input The input data to sign.
  # @return {WordArray} the HMAC signatures
  @sign : ( { key , input } ) -> (new Concat key).finalize(input)

  # Sign using the bulk async callback-based interface.
  # @option arg {WordArray} key The key to use for signing.
  # @option arg {WordArray} input The input to sign
  # @option arg {Function} progress_hook A standard progress hook
  # @param {callback} cb Calls back with a signature as a {WordArray} 
  @bulk_sign : (args, cb) ->
    args.klass = Concat
    args.what = "HMAC-SHA512-SHA3"
    bulk_sign args, cb

#=============================================

# The XOR HMAC combiner.  Good when you are shooting for PRF-qualities.
class XOR extends CombineBase

  # @param {WordArray} key The key to use, repeated for each klass
  # @param {Vector<Class>} klasses The classes to combine.
  constructor : (key, klasses = [ SHA512, SHA3 ] ) ->
    @hashers = (new HMAC(key, klass) for klass in klasses)
    super()

  # When resetting and reinitializing an XOR-HMAC-combiner, take the
  # extra precaution of putting a 0,1,2,3.... into the inner HMACs, so 
  # that even if the same HMAC is used, we don't get zero.
  reset : () ->
    super()
    (h.update(new WordArray [i]) for h,i in @hashers)
    @

  # The default output size if you use the default arguments,
  # which is Math.min(HMAC(SHA512), HMAC(SHA3))
  @get_output_size : () -> Math.max SHA512.output_size, SHA3.output_size

  # @private _coalesce
  # 
  # Combine the output of the temporary h into the accumulator out via XOR
  # @param {WordArray} out The targe accumulator
  # @param {WordArray} h The input HMAC to be combined.
  _coalesce : (out, h) -> out.xor h, {}

  # Gets the output size of this combination, which can only be known
  # once this Combiner has been allocated.  Call this if you're not
  # using the default Class parameters (SHA512 + SHA3).
  # @return {Number} The output size in bytes.
  get_output_size : () ->
    Math.max (h.get_output_size() for h in @hashers)...

  # Sign an input with the given key using this technique.
  # @param {WordArray} key The key to sign with.
  # @param {WordArray} input The input data to sign.
  # @return {WordArray} the HMAC signatures
  @sign : ( { key , input } ) -> (new XOR key).finalize(input)

  # Sign using the bulk async callback-based interface.
  # @option arg {WordArray} key The key to use for signing.
  # @option arg {WordArray} input The input to sign
  # @option arg {Function} progress_hook A standard progress hook
  # @param {callback} cb Calls back with a signature as a {WordArray} 
  @bulk_sign : (arg, cb) ->
    arg.klass = XOR
    arg.what = "HMAC-SHA512-XOR-SHA3"
    bulk_sign arg, cb

#=============================================

exports.Concat = Concat
exports.XOR = XOR

#=============================================

