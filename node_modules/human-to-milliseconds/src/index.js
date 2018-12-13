'use strict'

const promisify = require('promisify-es6')

const whole = /^((\d+(\.\d+)*)(ns|ms|us|µs|m|s|h))+$/
const pieces = /((\d+(\.\d+)*)(ns|ms|us|µs|m|s|h))/g
const measure = /(ns|ms|us|µs|m|s|h)/g

const multipliers = {
  ns: 1e-6,
  us: 0.001,
  µs: 0.001,
  ms: 1,
  s: 1000,
  m: 60000,
  h: 3.6e+6
}

function analyse (time) {
  let unit = time.match(measure)[0]
  time = time.substring(0, time.length - unit.length)

  return parseFloat(time) * multipliers[unit]
}

module.exports = promisify(function (time, callback) {
  if (typeof time !== 'string') {
    return callback(new Error('the first argument must be a string'))
  }

  if (!whole.test(time)) {
    return callback(new Error('invalid time'))
  }

  callback(null, time.match(pieces).reduce((sum, currentVal) => {
    return sum + analyse(currentVal)
  }, 0))
})
