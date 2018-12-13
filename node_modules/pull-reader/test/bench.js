

var crypto = require('crypto')

//make 10 mb of random data
var data = []
var l = 10
while(l--)
  data.push(crypto.randomBytes(1024))

var State = require('../state')
var BLState = require('../bl-state')

function runBench (State, assert) {
  ;[17, 56, 123, 456, 727, 2013, 9999].forEach(function (n) {


    var state = State()

    for(var i = 0; i < data.length; i++)
      state.add(data[i])

    var out = []
    while(state.has(n))
      out.push(state.get(n))
    out.push(state.get())

//    console.log(n, Date.now() - start)
    if(assert)
      require('assert').deepEqual(
        Buffer.concat(out),
        Buffer.concat(data)
      )
  })
}

var Suite = require('benchmark').Suite

new Suite()
  .add('BufferListState', function () {
    runBench(BLState)
  })
  .add('State', function () {
    runBench(State)
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run()
