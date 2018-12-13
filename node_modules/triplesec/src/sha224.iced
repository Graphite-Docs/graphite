##
##
## Forked from Jeff Mott's CryptoJS
##
##   https://code.google.com/p/crypto-js/
##

{WordArray} = require './wordarray'
{SHA256} = require './sha256'

#================================================================

class SHA224 extends SHA256
  @output_size : 224/8 # in bytes!
  output_size : SHA224.output_size

  _doReset: () ->
    @_hash = new WordArray [
        0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
        0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
      ]

  _doFinalize : () ->
    hash = super()
    hash.sigBytes -= 4;
    hash

  clone: () ->
    out = new SHA224()
    @copy_to out
    out

#================================================================

transform = (x) ->
  out = (new SHA224).finalize x
  x.scrub()
  out

#================================================================

exports.SHA224 = SHA224
exports.transform = transform

#================================================================
