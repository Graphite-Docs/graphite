
enc = require '../src/enc'
{WordArray} = require '../src/wordarray'
{rng} = require 'crypto'
colors = require 'colors'
{pbkdf2} = require '../src/pbkdf2'
{XOR} = require '../src/combine'
{scrypt} = require '../src/scrypt'

class GenerateSpec

  constructor : ->
    @version = 1
    @vectors = []

  gen_vector : (p, cb) ->
    which   = JSON.stringify p
    key     = rng p.key
    salt    = rng p.salt
    out     = { key, salt, dkLen : p.dkLen, c : p.c, r : p.r, N : p.N, p : p.p }
    p.key   = WordArray.from_buffer key
    p.salt  = WordArray.from_buffer salt
    p.klass = XOR
    await scrypt p, defer dk
    out.dk = dk.to_buffer()
    for k,v of out when Buffer.isBuffer v
      out[k] = v.toString 'hex'
    console.error "+ done with #{which}".green
    cb out

  gen_vectors : (cb) ->
    params = [ 
      { key : 10 , salt : 8 , dkLen : 128 , c : 32, N : 9, p : 1, r : 8  },
      { key : 40 , salt : 8 , dkLen : 128 , c : 32, N : 9, p : 1, r : 8  },
      { key : 80 , salt : 8 , dkLen : 128 , c : 32, N : 9, p : 1, r : 8  },
      { key : 160, salt : 8 , dkLen : 128 , c : 32, N : 9, p : 1, r : 8  },
      { key : 10 , salt : 16, dkLen : 128 , c : 32, N : 9, p : 1, r : 8  },
      { key : 40 , salt : 16, dkLen : 128 , c : 32, N : 9, p : 1, r : 8  },
      { key : 80 , salt : 16, dkLen : 128 , c : 32, N : 9, p : 1, r : 8  },
      { key : 160, salt : 16, dkLen : 128 , c : 32, N : 9, p : 1, r : 8  },
      { key : 10 , salt : 8 , dkLen : 512 , c : 32, N : 9, p : 1, r : 8  },
      { key : 40 , salt : 8 , dkLen : 512 , c : 32, N : 9, p : 1, r : 8  },
      { key : 80 , salt : 8 , dkLen : 512 , c : 32, N : 9, p : 1, r : 8  },
      { key : 160, salt : 8 , dkLen : 512 , c : 32, N : 9, p : 1, r : 8  },
      { key : 10 , salt : 8 , dkLen : 128 , c : 32, N : 6, p : 4, r : 8  },
      { key : 40 , salt : 8 , dkLen : 128 , c : 32, N : 6, p : 4, r : 8  },
      { key : 80 , salt : 8 , dkLen : 128 , c : 32, N : 6, p : 4, r : 8  },
      { key : 160, salt : 8 , dkLen : 128 , c : 32, N : 6, p : 4, r : 8  },
      { key : 10 , salt : 8 , dkLen : 128 , c : 32, N : 4, p : 4, r : 16 },
      { key : 40 , salt : 8 , dkLen : 128 , c : 32, N : 4, p : 4, r : 16 },
      { key : 80 , salt : 8 , dkLen : 128 , c : 32, N : 4, p : 4, r : 16 },
      { key : 160, salt : 8 , dkLen : 128 , c : 32, N : 4, p : 4, r : 16 },
    ]

    for p in params
      await @gen_vector p, defer v
      @vectors.push v
    cb()

  output : () ->
    { @version, "generated" : (new Date()).toString(), @vectors }

gs = new GenerateSpec()
await gs.gen_vectors defer()
console.log JSON.stringify gs.output(), null, 4

