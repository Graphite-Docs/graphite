'use strict'

const throttle = require('lodash.throttle')
exports = module.exports = TimeCache

function TimeCache (options) {
  if (!(this instanceof TimeCache)) {
    return new TimeCache(options)
  }

  options = options || {}

  const validity = options.validity || 30 // seconds

  const entries = new Map()

  const sweep = throttle(() => {
    entries.forEach((entry, key) => {
      const v = entry.validity || validity
      const delta = getTimeElapsed(entry.timestamp)
      if (delta > v) {
        entries.delete(key)
      }
    })
  }, 200)

  this.put = (key, value, validity) => {
    if (!this.has(key)) {
      entries.set(key, {
        value: value,
        timestamp: new Date(),
        validity: validity
      })
    }

    sweep()
  }

  this.get = (key) => {
    if (entries.has(key)) {
      return entries.get(key).value
    } else {
      throw new Error('key does not exist')
    }
  }

  this.has = (key) => {
    return entries.has(key)
  }
}

function getTimeElapsed (prevTime) {
  const currentTime = new Date()
  const a = currentTime.getTime() - prevTime.getTime()

  return Math.floor(a / 1000)
}
