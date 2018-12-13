

module.exports = function (onPause) {

  var wait, read, paused

  function reader (_read) {
    read = _read
    return function (abort, cb) {
      if(!paused) read(abort, cb)
      else        wait = [abort, cb]
    }
  }

  reader.pause = function () {
    if(paused) return
    paused = true
    onPause && onPause(paused)
  }

  reader.resume = function () {
    if(!paused) return
    paused = false
    onPause && onPause(paused)
    if(wait) {
      var _wait = wait
      wait = null
      read(_wait[0], _wait[1])
    }
  }

  return reader

}


