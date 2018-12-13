##
##
## Forked from Jeff Mott's CryptoJS
##
##   https://code.google.com/p/crypto-js/
##

{X64WordArray,WordArray} = require './wordarray'
{SHA512,Global} = require './sha512'

#================================================================

class SHA384 extends SHA512
  @output_size : 384/8 # in bytes!
  output_size : SHA384.output_size

  _doReset: () ->
    @_hash = new X64WordArray Global.convert [
      0xcbbb9d5d, 0xc1059ed8, 0x629a292a, 0x367cd507,
      0x9159015a, 0x3070dd17, 0x152fecd8, 0xf70e5939,
      0x67332667, 0xffc00b31, 0x8eb44a87, 0x68581511,
      0xdb0c2e0d, 0x64f98fa7, 0x47b5481d, 0xbefa4fa4
    ]

  _doFinalize : () ->
    hash = super()
    hash.sigBytes -= 16;
    hash

  clone: () ->
    out = new SHA384()
    @copy_to out
    out

#================================================================

transform = (x) ->
  out = (new SHA384).finalize x
  x.scrub()
  out

#================================================================

exports.SHA384 = SHA384
exports.transform = transform

#================================================================
