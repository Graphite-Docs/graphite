
var tape = require('tape')
var fsm = require('../')

var simple = {START: {ok: 'END'}, END: {}}
var stream =
  {
    START: {
      data   : 'START',
      pause  : 'PAUSED',
      end    : 'END',
      error  : 'ERROR'
    },
    PAUSED: {
      pause  : 'PAUSED',
      resume : 'START',
      error  : 'ERROR'
    },
    ERROR: {},
    END: {}
  }

var update =
  {
    START: {
      need_read: 'READY',
      end: 'END'
    },
    READY: { need_read: 'READY', reading: 'START' },
    END: {}
  }

var updown =
  {
    UP: {down: 'DOWN'},
    DOWN: {up: 'UP'}
  }

//(up,down)*

var liftsafe =
  {
    SAFE: {
      error: 'FAIL',
      up: 'SAFE',
      down: 'SAFE'
    },
    FAIL: {
      repair: 'SAFE'
    }
  }

//((up|down)*|(error,repair))*

var lift =
  {
    'UP-SAFE': {down: 'DOWN-SAFE', error: 'UP-FAIL'},
    'DOWN-SAFE': {up: 'UP-SAFE', error: 'DOWN-FAIL'},
    'UP-FAIL': {repair: 'UP-SAFE'},
    'DOWN-FAIL': {repair: 'DOWN-SAFE'}
  }

var valids = [simple, stream, update]

var invalids = [
  {START: {ok: 'NOT_A_STATE'}},
]

tape('valid', function (t) {
  valids.forEach(function (e) {
    t.ok(fsm.validate(e))
  })
  t.end()
})

tape('invalid', function (t) {
  invalids.forEach(function (e) {
    t.throws(function () {
      fsm.validate(e)
    })
  })
  t.end()
})

tape('deadlock', function (t) {
  t.deepEqual(fsm.deadlock(stream), ['ERROR', 'END'])
  t.deepEqual(fsm.deadlock(update), ['END'])
  t.end()
})

var livelock = {
  START: {ok: 'START'},
  END: {}
}

//what information should livelock return?
//the states that cannot reach the given terminal states.
tape('livelock', function (t) {
  t.deepEqual(fsm.livelock(livelock, ['END']), ['START'])
  t.end()
})

//take 2 fsm, and combine them into one, so that reachability etc
//can be calculated. they must share start and terimanal states

// when ever there is an event that both fsms share,
// they can only take that transition when they both allow it.

// Enforce that 'data' cannot occur after 'end'.
// {START: {data: START, end: END}, END: {}}

// Enforce that 'data' cannot occur when paused
// {START: {data: START, pause: PAUSED}, PAUSED: {resume: START}}

// Hmm, this would allow end to happen when paused.

// take a starting state, then expand all shared events from that state,
// then expand all non-shared states, creating split states.

//Enforce up and down must alternate.
// {UP: {down: DOWN}, DOWN: {up: UP}}

//if the lift breaks, it must not move, until repaired.
//this means it can actually fail in the UP or DOWN position,
//and when repaired, it must continue from there...
//but to express that in fsm it's easier to express the two aspects separately.


// now, in with some combinations of fsms, certain moves may become impossible.
// this is an error!


tape('combine', function (t) {
  var combined = fsm.combine(updown, liftsafe, 'DOWN', 'SAFE')
  console.log(combined)
  t.deepEqual(combined, lift)
  t.end()
})

// now, it's possible to combine two fsms in a way that breaks one of them.
// if there is a state missing in the new one, or a transition that is now impossible?
