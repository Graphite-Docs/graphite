##
##
## Forked from Jeff Mott's CryptoJS
##
##   https://code.google.com/p/crypto-js/
##

{WordArray} = require './wordarray'
util = require './util'

#=======================================================================

#
# Abstract buffered block algorithm template.
#
# The property blockSize must be implemented in a concrete subtype.
#
# @property {Number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
#
class BufferedBlockAlgorithm 

  _minBufferSize : 0

  # Does little other than eset/initialize internal state.
  constructor : () ->
    @reset()

  # Resets this block algorithm's data buffer to its initial state.
  reset : () ->
    @_data = new WordArray()
    @_nDataBytes = 0

  # Adds new data to this block algorithm's buffer.
  #
  # @param {WordArray} data The data to append. Strings are converted to a WordArray using UTF-8.
  #
  # @example
  #     bufferedBlockAlgorithm._append(wordArray);
  _append : (data) ->
    @_data.concat data
    @_nDataBytes += data.sigBytes

  #
  # Processes available data blocks.
  # 
  # This method invokes _doProcessBlock(offset), which must be implemented 
  # by a concrete subtype.
  #
  # @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
  # @return {WordArray} The processed data.
  #
  # @example
  #   processedData = bufferedBlockAlgorithm._process();
  #   processedData = bufferedBlockAlgorithm._process(!!'flush');
  #
  _process : (doFlush) ->
    data = @_data
    dataWords = data.words
    dataSigBytes = data.sigBytes
    blockSizeBytes = @blockSize * 4

    # Count blocks ready
    nBlocksReady = dataSigBytes / blockSizeBytes
    if doFlush
      # Round up to include partial blocks
      nBlocksReady = Math.ceil nBlocksReady
    else
      # Round down to include only full blocks,
      # less the number of blocks that must remain in the buffer
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);

    # Count words ready
    nWordsReady = nBlocksReady * @blockSize

    #Count bytes ready
    nBytesReady = Math.min(nWordsReady * 4, dataSigBytes)

    # Process blocks
    if nWordsReady
      for offset in [0...nWordsReady] by @blockSize 
        # Perform concrete-algorithm logic
        @_doProcessBlock dataWords, offset

      # Remove processed words
      processedWords = dataWords.splice 0, nWordsReady
      data.sigBytes -= nBytesReady

    # Return processed words
    new WordArray processedWords, nBytesReady

  # Copy the contents of the algorithm base to the given target
  # object (of the same class). Used in cloning.
  #
  # @param {BufferedBlockAlgorithm} out The object to copy to.
  copy_to : (out) ->
    out._data = @_data.clone()
    out._nDataBytes = @_nDataBytes

  #
  # Creates a copy of this object.
  #
  # @return {Object} The clone.
  #
  clone : ->
    obj = new BufferedBlockAlgorithm()
    @copy_to obj
    obj

#=======================================================================

#
# Abstract hasher template.
#
# @property {Number} blockSize The number of 32-bit words this hasher 
#   operates on. Default: 16 (512 bits)
#
class Hasher extends BufferedBlockAlgorithm

  constructor : () ->
    super()

  #
  # Resets this hasher to its initial state.
  #
  # @return {Hasher} Return `this` object for chaining
  reset : () ->
    super()
    # Perform concrete-hasher logic
    @_doReset()
    @ 
  
  #
  # Updates this hasher with a message.
  #
  # @param {WordArray} messageUpdate The message to append.
  #
  # @return {Hasher} This hasher for chaining.
  #
  update : (messageUpdate) ->
    @_append(messageUpdate)
    @_process()
    @

  #
  # Finalizes the hash computation.
  # Note that the finalize operation is effectively a destructive, 
  #  read-once operation.
  #
  # @param {WordArray} messageUpdate (Optional) A final message update.
  # @return {WordArray} The output hash message digest.
  #
  # @example
  #     hash = hasher.finalize()
  #     hash = hasher.finalize(wordArray)
  #
  finalize : (messageUpdate) ->
    @_append messageUpdate if messageUpdate
    @_doFinalize()


  #
  # Hashes from a buffer to a buffer
  #
  # @param {Buffer} input
  # @return {Buffer} output
  #
  bufhash : (input) -> 
    wa_in = WordArray.from_buffer input 
    wa_out = @finalize wa_in
    out = wa_out.to_buffer()
    wa_in.scrub()
    wa_out.scrub()
    out

#=======================================================================

exports.BlockCipher = class BlockCipher
  constructor : (key) ->
  encryptBlock : (M, offset) ->
    
#=======================================================================

# A base class for a stream cipher. This will be used for bonafide stream ciphers
# like {Salsa20} but also for {BlockCipher}s running in CTR mode.
class StreamCipher

  constructor : () ->

  # Encrypt one block's worth of data. Use the next block
  # in the keystream (order matters here!). Call into the 
  # virtual @get_pad() function to get the pad from the underlying
  # block cipher for this block.
  #
  # @param {WordArray} word_array The WordArray to operator on
  # @param {Number} dst_offset The offset to operate on, in wordGs
  # @return {Number} the number of blocks encrypted
  encryptBlock : (word_array, dst_offset = 0) ->
    pad = @get_pad()
    #console.log "pad -> #{pad.to_hex()}"
    n_words = Math.min(word_array.words.length - dst_offset, @bsiw)
    word_array.xor pad, { dst_offset, n_words }
    pad.scrub()
    @bsiw

  #---------------------

  # Encrypt an entire word array in place, overwriting the original
  # plaintext with the cipher text.
  # 
  # @param {WordArray} word_array The plaintext and also the ciphertext location.
  # @return {WordArray} Return `word_array` too just for convenient chaining.
  encrypt : (word_array) ->
    for i in [0...word_array.words.length] by @bsiw
      @encryptBlock word_array, i
    word_array

  #---------------------

  # Like `encrypt` but with an asynchronous preemptable interface.  Good
  # for encrypting big payloads without blocking up the process. As above,
  # encrypt in place, so the output ciphertext will be where the input
  # plaintext was.
  #
  # @param {WordArray} input The input cipher text
  # @param {Function} progress_hook A standard progress hook
  # @param {String} what What the progress hook should say we are doing.
  # @param {callback} cb Callback with the completed ciphertext after completion.
  bulk_encrypt : ({input, progress_hook, what}, cb) ->
    slice_args = 
      update : (lo,hi) =>
        for i in [lo...hi] by @bsiw
          @encryptBlock input, i
      finalize : () -> input
      default_n : @bsiw * 1024
    async_args = {progress_hook, cb, what }
    util.bulk input.sigBytes, slice_args, async_args

#=======================================================================

exports.BlockCipher = BlockCipher
exports.Hasher = Hasher
exports.BufferedBlockAlgorithm = BufferedBlockAlgorithm 
exports.StreamCipher = StreamCipher
