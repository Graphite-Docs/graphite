if require.main is module
  test = require 'iced-test'
  path = require 'path'
  iced = require 'iced-runtime'
  class Runner extends test.ServerRunner
    load_files : ({mainfile}, cb) ->
      @_dir = path.dirname mainfile
      @_files = ['test.iced']
      cb true

  test.run { mainfile: __filename, klass : Runner }
  return

{make_esc} = require './index.js'

always_fail = (cb) ->
  esc = make_esc cb
  cb new Error "fail"

some_func = (cb) ->
  esc = make_esc cb
  await always_fail esc defer()
  cb null

other_func = (cb) ->
  esc = make_esc cb, "other_func"
  await always_fail esc defer()
  cb null

# Trampoline is only used so the call stacks are higher, for testing purposes.
trampoline = (fx, cb) ->
  esc = make_esc cb, "trampoline"
  await fx esc defer()
  cb null

exports.test_set_cb_name = (T, cb) ->
  esc = make_esc cb
  await trampoline other_func, defer err
  T.assert err.istack?, "has istack"
  T.equal err.istack?.length, 2
  T.equal err.istack, ["other_func", "trampoline"]
  cb null

exports.test_default_cb_name = (T, cb) ->
  if parseInt(process.version.substring(1)) <= 5
    T.waypoint "skipping test, node #{process.version} does not support default esc names"
    return cb null
  esc = make_esc cb
  await trampoline some_func, defer err
  T.assert err.istack?, "has istack"
  T.equal err.istack?.length, 2
  T.equal err.istack, ["some_func", "trampoline"]
  cb null
