
{WordArray} = require './wordarray'
{StreamCipher} = require './algbase'

#=========================================

# A counter class that takes a vector of integers and increments
# by 1 repeatedly, with proper carry
class Counter

  WORD_MAX : 0xffffffff

  #---------------------------

  # @param {WordArray} value The initial value (or 0 if none given)
  # @param {Number} len The length in words if initializing with 0
  constructor : ({ value, len }) ->
    @_value = if value? then value.clone()
    else
      len = 2 unless len?
      new WordArray (0 for i in[0...len])

  #---------------------------

  # Increment the counter by 1, with proper carry
  # @return {Counter} Return `this` for chaining.
  inc : () ->
    go = true
    i = @_value.words.length - 1
    while go and i >= 0
      # This would be a horrible idea in C with 32-bit Uints, but
      # in JavaScript 64-bit float land, we get away with it.
      if ((++@_value.words[i]) > Counter.WORD_MAX) then @_value.words[i] = 0
      else go = false
      i--
    @

  #---------------------------

  # increment little-endian style, meaning, increment the leftmost byte
  # first, and then go left-to-right
  # @return {Counter} Return `this` for chaining.
  inc_le : () ->
    go = true
    i = 0
    while go and i < @_value.words.length
      if ((++@_value.words[i]) > Counter.WORD_MAX) then @_value.words[i] = 0
      else go = false
      i++
    @

  #---------------------------

  # Get the underlying value, borrowing the reference
  # @return {WordArray} the value
  get : () -> @_value
  
  #---------------------------

  # Copy the underlying value, cloning the WordArray
  # @return {WordArray} the value
  copy : () -> @_value.clone()

#=========================================

# A CTR-mode based cipher.  Takes a BlockCipher and an IV,
# and yields a StreamCipher
class Cipher extends StreamCipher

  # @param {BlockCipher} block_cipher An initialized block cipher
  # @param {WordArray} iv A random IV, please don't reuse an old one!
  constructor :( { @block_cipher, @iv } ) ->
    super()
    @bsiw = @block_cipher.blockSize / 4 # block size in words
    unless (@iv.sigBytes is @block_cipher.blockSize)
      throw new Error "IV is wrong length (#{@iv.sigBytes})"
    @ctr = new Counter { value : @iv }   

  # Scrub out all potentially sensitive data.
  scrub : () ->
    @block_cipher.scrub()

  # In fulfillment of the {StreamCipher} interface, get a random pad
  # that's the same size as the block size of the underlying BlockCipher.
  # Increment the counter as necessary, so we obviously get a different value
  # in the next iteration..
  # 
  # @return {WordArray} The encrypted pad that's going to be XORed with the plaintext.
  get_pad : () ->
    pad = @ctr.copy()
    @ctr.inc()
    @block_cipher.encryptBlock pad.words
    pad

#---------------

# Given a block cipher and an IV, encrypt the given input in CTR-mode.
# 
# @param {BlockCipher} block_cipher an instantiated, initialized block cipher
# @param {WordArray} iv The random initial value.
# @param {WordArray} input The to encrypt
# @return {WordArray} The encrypted ciphertext.
encrypt = ({block_cipher, iv, input}) ->
  cipher = new Cipher { block_cipher, iv}
  ret = cipher.encrypt input
  cipher.scrub()
  ret

#---------------

# Given a block cipher and an IV, encrypt the given input in CTR-mode.
# Do it an an async-fashion so as not to lock up the process.
# 
# @param {BlockCipher} block_cipher an instantiated, initialized block cipher
# @param {WordArray} iv The random initial value.
# @param {WordArray} input The to encrypt
# @param {Function} progress_hook A standard progress hook.
# @param {String} what Report to the progress_hook what's going on (e.g. "AES" or "Twofish")
# @param {callback} cb Callback completed with a {WordArray} that's the ciphertext
bulk_encrypt = ({block_cipher, iv, input, progress_hook, what}, cb) ->
  cipher = new Cipher { block_cipher, iv }
  await cipher.bulk_encrypt { input, progress_hook, what }, defer ret
  cb ret

#=========================================

exports.Counter = Counter
exports.Cipher = Cipher
exports.encrypt = encrypt
exports.bulk_encrypt = bulk_encrypt
