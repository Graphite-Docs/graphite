'use strict'

const exp = Math.exp

exports =
module.exports =
function MovingAverage (timespan) {
  if (typeof timespan !== 'number') { throw new Error('must provide a timespan to the moving average constructor') }

  if (timespan <= 0) { throw new Error('must provide a timespan > 0 to the moving average constructor') }

  let ma     // moving average
  let v = 0  // variance
  let d = 0  // deviation
  let f = 0  // forecast

  let previousTime

  let ret = {}

  function alpha (t, pt) {
    return 1 - (exp(-(t - pt) / timespan))
  }

  ret.push =
  function push (time, value) {
    if (previousTime) {
      // calculate moving average
      const a = alpha(time, previousTime)
      const diff = value - ma
      const incr = a * diff
      ma = a * value + (1 - a) * ma
      // calculate variance & deviation
      v = (1 - a) * (v + diff * incr)
      d = Math.sqrt(v)
      // calculate forecast
      f = ma + a * diff
    } else {
      ma = value
    }
    previousTime = time
  }

  // Exponential Moving Average

  ret.movingAverage =
  function movingAverage () {
    return ma
  }

  // Variance
  ret.variance =
  function variance () {
    return v
  }

  ret.deviation =
  function deviation () {
    return d
  }

  ret.forecast =
  function forecast () {
    return f
  }

  return ret
}
