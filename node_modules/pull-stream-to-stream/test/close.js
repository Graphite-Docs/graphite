

var CS = require('../')

var pull = require('pull-stream')

require('tape')('test close', function (t) {

  t.plan(10)

  var i = 10
  var cs = CS(null, pull(pull.infinite(), pull.through(null, function () {
    console.log('CLOSE')
    t.end()
  })))
  .on('data', function (data) {
    t.ok(data)
    if(!--i) cs.destroy()
  })

})


require('tape')('test end', function (t) {

  t.plan(10)

  var i = 10
  var cs = CS(null, pull(pull.infinite(), pull.through(null, function () {
    console.log('ENDED')
    t.end()
  })))
  .on('data', function (data) {
    t.ok(data)
    if(!--i) cs.end()
  })

})

require('tape')('test end async', function (t) {

  t.plan(10)

  var cs = CS(pull.asyncMap(function (val, cb) {
    setTimeout(function () {
      cb(null, val)
    }, 10)
  }))

  cs.on('data', function (data) {
    t.ok(data)
  })

  cs.on('end', function () {
    t.end()
  })

  for (var i=0;i<10;i++) {
    cs.write(Buffer('world'))
  }

  cs.end()
})
