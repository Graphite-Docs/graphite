
{SingleFlightTable} = require '../..'

exports.singleflight = (T,cb) ->

  tab = new SingleFlightTable()
  await tab.enter { seqid : 1, key : "a" }, T.esc(defer(lock), cb)
  lock.release()
  await setTimeout defer(), 1
  T.assert not(tab._jobs.a?), "no 'a' value should be available; it should have been cleaned out"
  await tab.enter { seqid : 1, key : "a" }, T.esc(defer(lock1), cb)
  await tab.enter { seqid : 1, key : "a", }, defer err
  T.assert err?, "should have gotten a preemption error"
  rv = new iced.Rendezvous
  tab.enter { seqid : 2, key : "a" }, rv.id(2).defer err, lock2
  lock1.release()
  await rv.wait defer val
  T.equal val, 2, "got waiter 2 back"
  T.assert not(err?), "no error"
  tab.enter { seqid : 3, key : "a"}, rv.id(3).defer err3, lock3
  tab.enter { seqid : 5, key : "a"}, rv.id(5).defer err5, lock5
  tab.enter { seqid : 4, key : "a"}, rv.id(4).defer err4, lock4
  await rv.wait defer val
  T.equal val, 3, "got waiter 3 back"
  T.assert err3?, "we got err3"
  await rv.wait defer val
  T.equal val, 4, "go waiter 4 back"
  T.assert err4?, "we got err4"
  lock2.release()
  await rv.wait defer val
  T.equal val, 5, "got waiter 5 back"
  lock5.release()
  await setTimeout defer(), 1
  T.assert not(tab._jobs.a?), "no 'a' value should be available; it should have been cleaned out"
  T.waypoint "done"

  cb null
