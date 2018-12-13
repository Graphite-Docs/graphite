'use strict'

const blake = require('blakejs')

const toCallback = require('./utils').toCallback

const minB = 0xb201
const minS = 0xb241

const blake2b = {
  init: blake.blake2bInit,
  update: blake.blake2bUpdate,
  digest: blake.blake2bFinal
}

const blake2s = {
  init: blake.blake2sInit,
  update: blake.blake2sUpdate,
  digest: blake.blake2sFinal
}

const makeB2Hash = (size, hf) => toCallback((buf) => {
  const ctx = hf.init(size, null)
  hf.update(ctx, buf)
  return Buffer.from(hf.digest(ctx))
})

module.exports = (table) => {
  for (let i = 0; i < 64; i++) {
    table[minB + i] = makeB2Hash(i + 1, blake2b)
  }
  for (let i = 0; i < 32; i++) {
    table[minS + i] = makeB2Hash(i + 1, blake2s)
  }
}
