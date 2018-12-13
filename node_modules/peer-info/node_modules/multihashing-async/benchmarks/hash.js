'use strict'

const Benchmark = require('benchmark')
const multihashing = require('../src')

const suite = new Benchmark.Suite('multihashing-async')

let list = []

const algs = [
  'sha1',
  'sha2-256',
  'sha2-512',
  'sha3-512',
  'sha3-384',
  'sha3-256',
  'sha3-224',
  'shake-128',
  'shake-256',
  'keccak-224',
  'keccak-256',
  'keccak-384',
  'keccak-512',
  'murmur3-32',
  'murmur3-128'
]

algs.forEach((alg) => {
  suite.add(alg, function (d) {
    const buf = Buffer.alloc(10 * 1024)
    buf.fill(Math.ceil(Math.random() * 100))

    multihashing(buf, alg, (err, res) => {
      if (err) throw err
      list.push(res)
      d.resolve()
    })
  }, {
    defer: true
  })
})
suite
  .on('cycle', (event) => {
    console.log(String(event.target))
    list = []
  })
  // run async
  .run({
    async: true
  })
