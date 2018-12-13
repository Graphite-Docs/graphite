'use strict'

console.log('PID: %s', process.pid)

const Benchmark = require('benchmark')
if (typeof window !== 'undefined') {
  window.Benchmark = Benchmark
}

const nodeCbor = require('cbor')

const fastCbor = require('../')
const vectors = require('../test/fixtures/vectors.js')

const fastDecoder = new fastCbor.Decoder()

const parsed = vectors
  .filter((v) => v.hex && v.decoded)
  .map((v) => JSON.stringify(v.decoded))

const buffers = vectors
  .filter((v) => v.hex && v.decoded)
  .map((v) => Buffer.from(v.hex, 'hex'))

const suite = new Benchmark.Suite('cbor')

let vecLength = vectors.length
let res = []

suite.add(`encode - node-cbor - ${vecLength}`, () => {
  for (let i = 0; i < vecLength; i++) {
    res.push(nodeCbor.encode(vectors[i].decoded)[0])
  }
})

suite.add(`encode - borc - ${vecLength}`, () => {
  for (let i = 0; i < vecLength; i++) {
    res.push(fastCbor.encode(vectors[i].decoded)[0])
  }
})

suite.add(`encode - stream - borc - ${vecLength}`, () => {
  const enc = new fastCbor.Encoder({stream (chunk) {
    res.push(chunk)
  }})
  for (let i = 0; i < vecLength; i++) {
    enc.write(vectors[i].decoded)
  }
})

suite.add(`encode - JSON.stringify - ${vecLength}`, () => {
  for (let i = 0; i < vecLength; i++) {
    res.push(JSON.stringify(vectors[i].decoded))
  }
})

// --

suite.add(`decode - node-cbor - ${buffers.length}`, () => {
  for (let i = 0; i < vecLength; i++) {
    nodeCbor.decodeAllSync(buffers[i])
  }
})

suite.add(`decode - borc - ${buffers.length}`, () => {
  for (let i = 0; i < buffers.length; i++) {
    res.push(fastDecoder.decodeFirst(buffers[i]))
  }
})

suite.add(`decode - JSON.parse - ${parsed.length}`, () => {
  for (let i = 0; i < parsed.length; i++) {
    res.push(JSON.parse(parsed[i]))
  }
})

suite
  .on('cycle', (event) => {
    res = []
    console.log(String(event.target))
  })
  .on('error', (err) => {
    throw err
  })
  .run({
    async: true
  })
