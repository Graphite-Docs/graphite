var pt   = require('../')
var pull = require('pull-stream')
var path = require('path')
var fs   = require('fs')
var test = require('tape')

var start = path.resolve(__dirname, '..')

function ls_error (start, type, err) {
  var i = 0
  type = type || pt.depthFirst
  return type(start, function (dir) {
    var def = pull.defer()
    if(++i == 10) {
      return function (_, cb) {
        cb(err)
      }
    }
    fs.readdir(dir, function (err, ls) {
      if(err)
        return def.abort(err.code === 'ENOTDIR' ? true : err)

      def.resolve(
        pull.values(ls || [])
        .pipe(pull.map(function (file) {
          return path.resolve(dir, file)
        }))
      )
    })

    return def
  })
}

test('depthFirst - error', function (t) {
  var seen = {}, err = new Error('test error'), i = 0
  //assert that for each item,
  //you have seen the dir already
  var n = 0
  t.plan(1)
  pull(
    ls_error(start, pt.depthFirst, err),
    pull.drain(null, function (_err) {
      console.log('END', ++n)
      t.equal(_err, err)
      t.end()
    })
  )

})



