module.exports = function (tape) {
  return function () {
    var t = tape.apply(this, arguments)
    var start = Date.now()
    t.on('end', function () {
      var now = Date.now()
      console.log('# time: ' + Math.round(now - start) + ' ms')
    })
    return t
  }
}
