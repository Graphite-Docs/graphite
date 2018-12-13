

module.exports = function (fn) {
  var active = false, called = 0
  return function () {
    called = true
    if(!active) {
      active = true
      while(called) {
        called = false
        fn()
      }
      active = false
    }
  }
}








