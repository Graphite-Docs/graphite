
function isFunction (f) {
  return 'function' === typeof f
}

function isDuplex (d) {
  return 'object' === typeof d && isSource(d.source) && isSink(d.sink)
}

function isSource (s) {
  return isFunction(s) && s.length === 2
}

function isSink (s) {
  return isFunction(s) && s.length === 1
}

exports.isDuplex = isDuplex
exports.isSource = isSource
exports.isSink = isSink
//can't do is through, it will appear as a sink til you git it a source.

