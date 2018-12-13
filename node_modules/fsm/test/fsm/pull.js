
module.exports = {
  START: {
    piped: 'READY'
  },
  READY: {
    read: 'READING',
    abort: 'ABORTING'
  },
  READING: {
    cb: 'READY',
    end: 'END',
    error: 'ERROR'
  },
  ABORTING: {
    cb: 'END'
  },
  END: {},
  ERROR: {}
}
