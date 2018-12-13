
{prng} = require 'crypto'
{WordArray} = require '../src/wordarray'

out = []
for kl in [16...256] by 8  # make them even multiple of 32-bit-guys
  for ml in [0...2048] by 256
    k = prng kl
    m = prng ml
    out.push { key : k.toString('hex'), msg : m.toString('hex') }

console.log "exports.data = #{JSON.stringify out, null, 4};"