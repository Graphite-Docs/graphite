
var event = /^Ev (\w+)\/(\w+) (\w+)?$/

function parse (line) {
  var m = event.exec(line)
  if(m)
    return {type: m[1], id: m[2], name: m[3]}
}

function first (obj) {
  for(var k in obj)
    return k
}

function q(s) {
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

if(!module.parent) {
  var split = require('split')
  var through = require('through')
  var path = require('path')

  var instances = {}

  var types = {}
  process.argv.slice(2).forEach(function (filename) {
    name = path.basename(filename).replace(/\.\w+$/, '')
    types [name] = require(filename)
  })

  process.stdin
    .pipe(split())
    .pipe(through(function (line) {
      //Ev type/instance event
      var ev = parse(line)
      if(!ev) return
      console.error('event', ev)

      var id = ev.type + '/' + ev.id
      if(!ev.name) //creating the instance
        if(instances[id])
          throw new Error('instance with same id:' + id + ' created twice')

      if(!instances[id] && ) {
        if(!types[ev.type])
          throw new Error('unknown type: ' + ev.type)

        instances[id] = instance(types[ev.type], ev.type)
      }

      instances[id](ev.name)
    }, function () {
      //check whether there are any unended instances
      //instances which are not in a terminal state...
    
    }))
}
