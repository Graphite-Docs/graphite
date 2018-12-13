
enc = require '../src/enc'
{WordArray} = require '../src/wordarray'
{rng} = require 'crypto'
{fake_rng} = require '../src/util'
colors = require 'colors'
argv = require('optimist').alias('v', 'version').demand('v').argv

class MemoRng 

  constructor : () ->
    @buffers = [] 

  empty : () ->
    out = Buffer.concat @buffers
    @buffers = []
    out

  gen : (n) ->
    buf = rng n
    @buffers.push buf
    WordArray.from_buffer buf

class GenerateSpec

  constructor : ->
    @version = argv.v
    @vectors = []
    @memo_rng = new MemoRng
    @rng = (n,cb) => cb @memo_rng.gen n

  gen_vector : (len, cb) ->
    key = rng len.key
    data = rng len.msg
    pt = new Buffer data # make a copy!
    await enc.encrypt { key, data, @rng, @version }, defer err, ct
    console.error "+ done with version #{@version} #{JSON.stringify len}".green
    r = @memo_rng.empty()
    ret = { key, pt, ct, r }
    (ret[k] = v.toString('hex') for k,v of ret)
    cb ret

  gen_vectors : (cb) ->
    params = [ { key : 10, msg : 100 },
               { key : 20, msg : 300 },
               { key : 40, msg : 1000 },
               { key : 60, msg : 5000 },
               { key : 100, msg : 10000 },
               { key : 250, msg : 50000 } ]
    for p in params
      await @gen_vector p, defer v
      @vectors.push v
    cb()

  output : () ->
    { @version, "generated" : (new Date()).toString(), @vectors }

gs = new GenerateSpec()
await gs.gen_vectors defer()
console.log JSON.stringify gs.output(), null, 4





