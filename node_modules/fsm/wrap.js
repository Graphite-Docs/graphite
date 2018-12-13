var pull = require('pull-stream')
function event (e) {
  console.log(e)
}

var pullFSM = require('./test/fsm/pull')

function q (s) {
  return JSON.stringify(s)
}

function instance (fsm, type) {
  var state = fsm.START ? 'START' : first(fsm)
  return function (event) {
    console.error(event, state)
    console.error(fsm)
    if(!fsm[state][event])
      throw new Error('event:' + q(event) + ' is forbidden in state:'+ q(state) + ' on type:' + q(type))
    state = fsm[state][event]
  }
}
var event = instance(pullFSM, 'pull-stream')

module.exports = function fsmed (read) {
  event('piped')
  return function (abort, cb) {
    event(abort ? 'abort' : 'read')
    read(abort, function (end, data) {
      event(end === true ? 'end' : end ? 'error' : 'cb')
      cb(end, data)
    })
  }
}

