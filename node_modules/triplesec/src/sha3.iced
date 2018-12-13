##
##
## Forked from Jeff Mott's CryptoJS
##
##   https://code.google.com/p/crypto-js/
##

{WordArray,X64Word,X64WordArray} = require './wordarray'
{Hasher} = require './algbase'

#=======================================================================

class Global

  #------------------
  
  constructor : ->

    # Constants tables
    @RHO_OFFSETS = []
    @PI_INDEXES  = []
    @ROUND_CONSTANTS = []
    @T = []

    @compute_rho_offsets()
    @compute_pi_indexes()
    @compute_round_constants()
    @make_reusables()

  #------------------
  
  compute_rho_offsets : ->
    x = 1
    y = 0
    for t in [0...24]
      @RHO_OFFSETS[x + 5 * y] = ((t + 1) * (t + 2) / 2) % 64
      newX = y % 5
      newY = (2 * x + 3 * y) % 5
      x = newX
      y = newY

  #------------------
  
  compute_pi_indexes : ->
    for x in [0...5]
      for y in [0...5]
        @PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5

  #------------------
  
  compute_round_constants : ->
    LFSR = 0x01
    for i in [0...24]
      roundConstantMsw = 0
      roundConstantLsw = 0

      for j in [0...7]
        if (LFSR & 0x01) 
          bitPosition = (1 << j) - 1
          if (bitPosition < 32) 
            roundConstantLsw ^= 1 << bitPosition
          else # if (bitPosition >= 32) 
            roundConstantMsw ^= 1 << (bitPosition - 32)

        # Compute next LFSR
        if (LFSR & 0x80) 
          # Primitive polynomial over GF(2): x^8 + x^6 + x^5 + x^4 + 1
          LFSR = (LFSR << 1) ^ 0x71
        else 
          LFSR <<= 1

      @ROUND_CONSTANTS[i] = new X64Word roundConstantMsw, roundConstantLsw

  #------------------

  make_reusables : ->
    @T = (new X64Word(0,0) for i in [0...25])
  
#=======================================================================

glbl = new Global()

#=======================================================================

#  
# SHA-3 hash algorithm.
#  
exports.SHA3 = class SHA3 extends Hasher

  @outputLength : 512                            # in bits!
  outputLength : SHA3.outputLength               # in bits
  @blockSize : (1600 - 2 * SHA3.outputLength)/32 # in # of 32-bit words
  blockSize : SHA3.blockSize                     # in # of 32-bit words
  @output_size : SHA3.outputLength / 8           # in bytes
  output_size : SHA3.output_size                 # in bytes

  _doReset : () ->
    @_state = (new X64Word(0,0) for i in [0...25])

  _doProcessBlock : (M, offset) ->
    G = glbl
    # Shortcuts
    state = @_state
    nBlockSizeLanes = @blockSize / 2

    # Absorb
    for i in [0...nBlockSizeLanes]
      # Shortcuts
      M2i  = M[offset + 2 * i]
      M2i1 = M[offset + 2 * i + 1]

      # Swap endian
      M2i = (
        (((M2i << 8)  | (M2i >>> 24)) & 0x00ff00ff) |
        (((M2i << 24) | (M2i >>> 8))  & 0xff00ff00)
      )
      M2i1 = (
        (((M2i1 << 8)  | (M2i1 >>> 24)) & 0x00ff00ff) |
        (((M2i1 << 24) | (M2i1 >>> 8))  & 0xff00ff00)
      )

      # Absorb message into state
      lane = state[i]
      lane.high ^= M2i1
      lane.low  ^= M2i

    # Rounds
    for round in [0...24] 
      # Theta
      for x in [0...5] 
        # Mix column lanes
        tMsw = tLsw = 0
        for y in [0...5] 
          lane = state[x + 5 * y]
          tMsw ^= lane.high
          tLsw ^= lane.low

        # Temporary values
        Tx = G.T[x]
        Tx.high = tMsw
        Tx.low  = tLsw
      
      for x in [0...5] 
        # Shortcuts
        Tx4 = G.T[(x + 4) % 5]
        Tx1 = G.T[(x + 1) % 5]
        Tx1Msw = Tx1.high
        Tx1Lsw = Tx1.low

        # Mix surrounding columns
        tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31))
        tLsw = Tx4.low  ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31))
        for y in [0...5] 
          lane = state[x + 5 * y]
          lane.high ^= tMsw
          lane.low  ^= tLsw

      # Rho Pi
      for laneIndex in [1...25]
        # Shortcuts
        lane = state[laneIndex]
        laneMsw = lane.high
        laneLsw = lane.low
        rhoOffset = G.RHO_OFFSETS[laneIndex]

        # Rotate lanes
        if (rhoOffset < 32) 
          tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset))
          tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset))
        else # if (rhoOffset >= 32)
          tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset))
          tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset))

        # Transpose lanes
        TPiLane = G.T[G.PI_INDEXES[laneIndex]]
        TPiLane.high = tMsw
        TPiLane.low  = tLsw

      # Rho pi at x = y = 0
      T0 = G.T[0]
      state0 = state[0]
      T0.high = state0.high
      T0.low  = state0.low

      # Chi
      for x in [0...5] 
        for y in [0...5]
          # Shortcuts
          laneIndex = x + 5 * y
          lane = state[laneIndex]
          TLane = G.T[laneIndex]
          Tx1Lane = G.T[((x + 1) % 5) + 5 * y]
          Tx2Lane = G.T[((x + 2) % 5) + 5 * y]

          # Mix rows
          lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high)
          lane.low  = TLane.low  ^ (~Tx1Lane.low  & Tx2Lane.low)

      # Iota
      lane = state[0]
      roundConstant = G.ROUND_CONSTANTS[round]
      lane.high ^= roundConstant.high
      lane.low  ^= roundConstant.low

  #----------------

  _doFinalize : ->
    # Shortcuts
    data = @_data
    dataWords = data.words
    nBitsTotal = @_nDataBytes * 8
    nBitsLeft = data.sigBytes * 8
    blockSizeBits = @blockSize * 32

    # Add padding
    dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - nBitsLeft % 32)
    dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80
    data.sigBytes = dataWords.length * 4

    # Hash final blocks
    @_process();

    # Shortcuts
    state = @_state
    outputLengthBytes = @outputLength / 8
    outputLengthLanes = outputLengthBytes / 8

    # Squeeze
    hashWords = []
    for i in [0...outputLengthLanes] 
      # Shortcuts
      lane = state[i]
      laneMsw = lane.high
      laneLsw = lane.low

      # Swap endian
      laneMsw = (
        (((laneMsw << 8)  | (laneMsw >>> 24)) & 0x00ff00ff) |
        (((laneMsw << 24) | (laneMsw >>> 8))  & 0xff00ff00)
      )
      laneLsw = (
        (((laneLsw << 8)  | (laneLsw >>> 24)) & 0x00ff00ff) |
        (((laneLsw << 24) | (laneLsw >>> 8))  & 0xff00ff00)
      )

      # Squeeze state to retrieve hash
      hashWords.push(laneLsw);
      hashWords.push(laneMsw);

    # Return final computed hash
    new WordArray hashWords, outputLengthBytes

  #----------------

  copy_to : (obj) ->
    super obj
    obj._state = (s.clone() for s in @_state)

  #----------------

  scrub : () ->

  #----------------

  clone : ->
    out = new SHA3()
    @copy_to out
    out

#=======================================================================

exports.transform = (x) ->
  out = (new SHA3).finalize x
  x.scrub()
  out
  
#=======================================================================

