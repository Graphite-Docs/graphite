var pull = require('pull-stream')
var fs = require('fs')
var file = fs.readFileSync(__filename, 'utf-8').split(/(\n)/).map(function (e) { return new Buffer(e) })
var decode = require('../')

console.log(file)

var test = require('tape')

//handle old node and new node
function A(buf) {
  return [].slice.call(buf)
}

test('lines', function (t) {

  pull(
    pull.values(file),
    decode('utf8'),
    pull.collect(function (err, ary) {
      if(err) throw err
      console.log(ary.join(''))
      t.equal(file.map(String).join(''), ary.join(''))
      t.end()
    })
  )

})

test('utf-8', function (t) {
  var expected = 'cents:¢\neuros:€'

  var coinage = [
    A(new Buffer('cents:')),
    [0xC2, 0xA2],
    A(new Buffer('\n')),
    A(new Buffer('euros:')),
    [0xE2, 0x82, 0xAC]
  ].reduce(function (a, b) {
    return a.concat(b)
  })

  function rSplit() {
    var s = coinage.slice()
    var a = []
    while(s.length) {
      var n = ~~(Math.random()*s.length) + 1
      a.push(s.splice(0, n))
    }
    return a.map(function (e) { return new Buffer(e) })
  }

  t.plan(100)
  var N = 100

  while(N--)
    pull(
      pull.values(rSplit()),
      decode(),
      pull.collect(function (err, ary) {
        t.equal(ary.join(''), expected)
      })
    )

  t.end()

})












