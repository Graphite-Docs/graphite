function each(obj, iter) {
  for(var key in obj) {
    var value = obj[key]
    iter(value, key, obj)
  }
}

function keys (obj) {
  return Object.keys(obj).sort()
}

function contains (a, v) {
  return ~a.indexOf(v)
}
function union (a, b) {
  return a.filter(function (v) {
    return contains(b, v)
  })
}

function disunion1(a, b) {
  return a.filter(function (v) {
    return !contains(b, v)
  })
}

function disunion(a, b) {
  return a.filter(function (v) {
    return !contains(b, v)
  }).concat(b.filter(function (v) {
    return !contains(a, v)
  })).sort()
}

function equal (a, b) {
  if(a.length != b.length) return false
  for(var i in a)
    if(b[i] !== a[i]) return false
}

function empty (v) {
  for(var k in v)
    return false
  return true
}

//check that all transitions are to valid states.
var validate = exports.validate = function (fsm) {
  var states = Object.keys(fsm)
  each(fsm, function (state, name) {
    each(state, function (_state, event) {
      if(!fsm[_state])
        throw new Error(
            'invalid transition from state:' + name
          + ' to state:' + _state
          + ' on event:' + event
        )
    })
  })
  return true
}

//get a list of all states that are reachable from any given state.
//(with the shortest paths?)
// returns object: {STATES: {REACHABLE_STATE: path}}

var reachable = exports.reachable = function (fsm) {
  var reachable = {}
  var added = false
  do {
    added = false
    each(fsm, function (state, name) {
      var reach = reachable[name] = reachable[name] || {}
      //add any state that can be reached directly.
      each(state, function (_name, event) {
        if(!reach[_name]) reach[_name] = [event], added = true
      })
      //add any state that can be reached from a state you can reach directly.
      each(state, function (_name, event) {
        var _state = reachable[_name]
        each(_state, function (path, _name) {
          if(!reach[_name])
            reach[_name] = [event].concat(path), added = true
        })
      })
    })
  } while(added);
  return reachable
}

// deadlock: are there any dead ends that cannot reach another state?

exports.terminal =
exports.deadlock = function (fsm) {
  var dead = []
  each(fsm, function (state, name) {
    if(empty(state)) dead.push(name)
  })
  return dead
}

// livelock; are there any cycles that cannot reach a terminal state?
// return any states that cannot reach the given terminal states,
// unless they are themselves terminal states.

var livelock = exports.livelock = function (fsm, terminals) {
  var reach = reachable(fsm), locked = []
  each(reach, function (reaches, name) {
    if(contains(terminals, name)) return
    each(terminals, function (_name) {
      if(!reaches[_name] && !contains(locked, name))
        locked.push(name)
    })
  })
  return locked.sort()
}


function events (fsm) {
  var events = []
  each(fsm, function (state, name) {
    each(state, function (_state, event) {
      if(!contains(events, event)) events.push(event)
    })
  })
  return events.sort()
}

var combine = exports.combine = function (fsm1, fsm2, start1, start2) {
  var combined = {}
  var events1 = events(fsm1)
  var events2 = events(fsm2)
  var independent = disunion(events1, events2)

  function expand(name1, name2) {
    var cName = name1 + '-' + name2, state
    if(!combined[cName]) combined[cName] = {}
    state = combined[cName]

    //Q: what are the events which are allowed to occur from this state?
    //A: independent events (used in only one fsm) or events that occur in both fsms in current state.

    var trans1 = keys(fsm1[name1]), trans2 = keys(fsm2[name2])
    var allowed = union(trans1, trans2)

    //expand to a new state
    allowed.forEach(function (event) {
      state[event] = fsm1[name1][event] + '-' + fsm2[name2][event]
      if(!combined[state[event]])
        expand(fsm1[name1][event], fsm2[name2][event])
    })

    //only transition fsm1
    union(independent, trans1).forEach(function (event) {
      state[event] = fsm1[name1][event] + '-' + name2
      if(!combined[state[event]])
        expand(fsm1[name1][event], name2)
    })

    union(independent, trans2).forEach(function (event) {
      state[event] =  name1 + '-' + fsm2[name2][event]
      if(!combined[state[event]])
        expand(name1, fsm2[name2][event])
    })

    return combined[cName]
  }

  expand(start1, start2)
  return combined
}

