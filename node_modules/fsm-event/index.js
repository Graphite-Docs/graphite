const EventEmitter = require('events').EventEmitter
const assert = require('assert')
const fsm = require('fsm')

module.exports = fsmEvent

// create an fsmEvent instance
// obj -> fn
function fsmEvent (start, events) {
  if (typeof start === 'object') {
    events = start
    start = 'START'
  }
  assert.equal(typeof start, 'string')
  assert.equal(typeof events, 'object')
  assert.ok(events[start], 'invalid starting state ' + start)
  assert.ok(fsm.validate(events))

  const emitter = new EventEmitter()
  emit._graph = fsm.reachable(events)
  emit._emitter = emitter
  emit._events = events
  emit._state = start
  emit.emit = emit
  emit.on = on

  return emit

  // set a state listener
  // str, fn -> null
  function on (event, cb) {
    emitter.on(event, cb)
  }

  // change the state
  // str -> null
  function emit (str) {
    const nwState = emit._events[emit._state][str]
    if (!reach(emit._state, nwState, emit._graph)) {
      const err = 'invalid transition: ' + emit._state + ' -> ' + str
      return emitter.emit('error', err)
    }

    const leaveEv = emit._state + ':leave'
    const enterEv = nwState + ':enter'

    if (!emit._state) return enter()
    return leave()

    function leave () {
      if (!emitter._events[leaveEv]) enter()
      else emitter.emit(leaveEv, enter)
    }

    function enter () {
      if (!emitter._events[enterEv]) done()
      else emitter.emit(enterEv, done)
    }

    function done () {
      emit._state = nwState
      emitter.emit(nwState)
      emitter.emit('done')
    }
  }
}

// check if state can reach in reach
// str, str, obj -> bool
function reach (curr, next, reachable) {
  if (!next) return false
  if (!curr) return true

  const here = reachable[curr]
  if (!here || !here[next]) return false
  return here[next].length === 1
}
