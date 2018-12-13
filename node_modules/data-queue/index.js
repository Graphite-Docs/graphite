"use strict"

const EE = require("events").EventEmitter

function DataQueue() {
  const ee = new EE()
  let q = []
  let ed

  function unleak() {
    ee.removeAllListeners("err")
    ee.removeAllListeners("data")
  }

  return {
    append: data => {
      if (ed) return ed
      q.push(data)
      ee.emit("data")
    },
    prepend: data => { //better only call this before the get queue starts
      if (ed) return ed
      q.unshift(data)
    },
    error: e => {
      ed = e
      ee.emit("err", e)
    },
    get: cb => {
      unleak()
      if (ed) return cb(ed)
      if (q.length) return cb(null, q.shift())
      ee.once("err", e => {
        unleak()
        cb(e)
      })
      ee.once("data", () => {
        unleak()
        return cb(null, q.shift())
      })
    },
    height: () => q.length
  }
}
module.exports = DataQueue
