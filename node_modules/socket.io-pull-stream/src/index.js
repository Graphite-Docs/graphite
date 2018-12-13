'use strict'

// socket.io-pull-stream
const Queue = require('data-queue')
const uuid = require('uuid')
const pull = require('pull-stream')
const sioname = (type, name) => 'socket.io-pull-stream.' + type + (name ? '.' + name : '')
const debug = require('debug')
const _log = debug('socket.io-pull-stream')

function doCodec (codec, data) {
  if (data == null) return data
  try {
    return codec(data)
  } catch (e) {
    console.error('Codec Error')
    console.error(e)
    return false
  }
}

const codecs = {
  hex: {
    encode: v => v.toString('hex'),
    decode: v => Buffer.from(v, 'hex')
  },
  plain: {
    encode: v => v,
    decode: v => v
  },
  buffer: { // always do Buffer.from because browsers
    encode: v => Buffer.from(v),
    decode: v => Buffer.from(v)
  }
}

function getCodec (c) {
  if (!c) c = 'plain'
  if (typeof c === 'object') return c
  const co = codecs[c]
  if (!co) throw new Error('Invalid codec ' + c)
  return co
}

function SIOSource (sio, id, opt) {
  const q = Queue()
  const log = sio.sioplog.bind(sio.sioplog, 'source(' + id + ')')
  const codec = getCodec(opt.codec).decode
  log('create source')
  sio.emit(sioname('accept', id))

  function unlisten () {
    sio.removeAllListeners(sioname('error', id))
    sio.removeAllListeners(sioname('queue', id))
  }

  sio.on(sioname('error', id), err => {
    if (err === true) log('finish')
    else log('error')
    unlisten()
    q.append({end: err})
  })
  sio.on(sioname('queue', id), data => {
    log('queue data')
    q.append({data: doCodec(codec, data)})
  })
  sio.once('disconnect', () => {
    unlisten()
    q.append({end: true})
  })
  return function (end, cb) {
    log('reading')
    if (end) return cb(end)
    q.get((err, data) => {
      if (err) return cb(err)
      if (data.end) {
        q.error(data.end)
        return cb(data.end)
      }
      return cb(null, data.data)
    })
  }
}

function SIOSink (sio, id, opt) {
  const q = Queue()
  const log = sio.sioplog.bind(sio.sioplog, '  sink(' + id + ')')
  const codec = getCodec(opt.codec).encode
  let ended
  log('create sink')
  sio.once(sioname('accept', id), () => {
    log('start transmission')

    function loop () {
      q.get((_, val) => {
        let {data, err} = val || {}
        if (_) err = _
        log('send', err && err === true ? 'finish' : err ? 'error' : data ? 'data' : '<invalid>')
        if (err && !_) q.error(err)
        if (err) return sio.emit(sioname('error', id), err)
        if (data) sio.emit(sioname('queue', id), doCodec(codec, data))
        loop()
      })
    }
    loop()
  })

  function doErr (end) {
    q.append({err: end})
    ended = end
  }

  sio.once('disconnect', () => doErr(true))

  return function (read) {
    read(null, function next (end, data) {
      if (end) return doErr(end)
      if (ended) return read(ended, next)
      q.append({data})
      read(null, next)
    })
  }
}

module.exports = function SIOPullStream (sio, opt) {
  if (sio.createSink) return
  sio.sioplog = sio.id ? _log.bind(_log, '[' + sio.id + ']') : _log
  sio.createSink = (id, _) => {
    if (!id) id = uuid()
    const sink = SIOSink(sio, id, opt || _)
    sink.id = id
    return sink
  }
  sio.createSource = (id, _) => {
    const source = SIOSource(sio, id, opt || _)
    source.id = id
    return source
  }
  sio.createProxy = (id, tsio, _) => {
    pull(
      sio.createSource(id, _),
      tsio.createSink(id, _)
    )
  }
}
