
##-----------------------------------------------------------------------

# A simple lock class for synchronization.
exports.Lock = class Lock

  constructor : ->
    @_open = true
    @_waiters = []

  # @param {callback} cb Callback when the lock is acquired.
  acquire : (cb) ->
    if @_open
      @_open = false
      cb()
    else
      @_waiters.push cb

  # Release a lock.
  release : ->
    if @_waiters.length
      w = @_waiters.shift()
      w()
    else
      @_open = true

  # Report whether a lock is open or not.
  open : -> @_open

##-----------------------------------------------------------------------

# The type of lock returned when interacting with the {Table} of locks
# below.
class NamedLock extends Lock

  # @param {Table} tab The parent lock table.
  # @param {String} name My name.
  constructor : (@tab, @name) ->
    super()
    @refs = 0
  incref : -> ++@refs
  decref : -> --@refs
  release : ->
    super()
    if @decref() is 0
      delete @tab.locks[@name]

##-----------------------------------------------------------------------

# A table of named locks.
exports.Table = class Table
  constructor : ->
    @locks = {}

  # @private
  # @param {String} name The name of the lock
  create : (name) ->
    l = new NamedLock this, name
    @locks[name] = l

  # @param {String} name The name of the lock to grab or create.
  # @param {callback} cb The callback to fire when acquired;
  #    Callback with `(l,was_open)` where `l` is the {NamedLock} and
  #    `was_open` is a bool saying whether it was open to begin with.
  acquire : (name, cb, wait) ->
    l = @locks[name] or @create(name)
    was_open = l._open
    l.incref()
    if wait or l._open
      await l.acquire defer()
    else
      l = null
    cb l, was_open

  # @param {String} name The name of the lock to grab.
  lookup : (name) -> @locks[name]

##-----------------------------------------------------------------------

class SingleFlighter

  constructor : ({@table, @key}) ->
    @seqid = null
    @waiter = null
    @open = true
    @refs = 0

  _incref : () -> ++@refs
  _decref : () -> if --@refs is 0 then @table._remove { @key }

  _enter : ({seqid}, cb) ->
    if @open
      @open = false
      @seqid = seqid
      cb null, @
    else if @waiter?
      if seqid > @waiter.seqid
        tmp = @waiter
        @waiter = { cb, seqid }
        tmp.cb new Error "our seqid=#{tmp.seqid} was preempted by #{seqid}"
      else
        cb new Error "our seqid=#{seqid} is too stale (since #{@waiter.seqid} is ahead of us)"
      @_decref()
    else if seqid > @seqid
      @waiter = { seqid, cb }
    else
      cb new Error "our seqid=#{seqid} is too stale (since #{@seqid} is already in flight)"
      @_decref()

  release : () ->
    if @waiter?
      {@seqid, cb} = @waiter
      @waiter = null
      cb null, @
    else
      @open = true
      @seqid = null
    @_decref()

##-----------------------------------------------------------------------

exports.SingleFlightTable = class SingleFlightTable

  constructor : () -> @_jobs = {}
  _create : ({key}) -> @_jobs[key] = new SingleFlighter { table : @, key : key }
  _remove : ({key}) -> delete @_jobs[key]
  enter : ({seqid, key}, cb) ->
    s = @_jobs[key] or @_create { key }
    s._incref()
    s._enter { seqid }, cb

##-----------------------------------------------------------------------

