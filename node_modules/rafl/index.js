var global = require('global')

/**
 * `requestAnimationFrame()`
 */

var request = global.requestAnimationFrame
  || global.webkitRequestAnimationFrame
  || global.mozRequestAnimationFrame
  || fallback

var prev = +new Date
function fallback (fn) {
  var curr = +new Date
  var ms = Math.max(0, 16 - (curr - prev))
  var req = setTimeout(fn, ms)
  return prev = curr, req
}

/**
 * `cancelAnimationFrame()`
 */

var cancel = global.cancelAnimationFrame
  || global.webkitCancelAnimationFrame
  || global.mozCancelAnimationFrame
  || clearTimeout

if (Function.prototype.bind) {
  request = request.bind(global)
  cancel = cancel.bind(global)
}

exports = module.exports = request
exports.cancel = cancel
