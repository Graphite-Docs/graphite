
var pull = require('pull-stream')

function type (type) {
  var i = 1
  return function instance () {
    var j = i++
    //log creation event
    console.log('Ev ' + type + '/' + j)
    return function (event) {
      console.log('Ev ' + type + '/' + j + ' ' + event)
    }
  }
}

var pfsm = type('pull')
var through = module.exports = function () {
  var log = pfsm()

  return function (read) {
    log('piped')
    return function (abort, cb) {
      log('read')
      read(abort, function (end, data) {
        log(end ? (end === true ? 'end' : 'error') : 'cb')
//        cb(end, data)
      })
    }
  }
}

if(!module.parent) {
  pull(pull.count(20), through(), pull.drain())
}
