'use strict'

const through = require('pull-through')

const DEFAULT_MAX_LENGTH = 100

module.exports = function block (_maxLength) {
  const maxLength = _maxLength || DEFAULT_MAX_LENGTH

  var buffered = []

  return through(
    function transform (data) {
      buffered = buffered.concat(data)

      while (buffered.length >= maxLength) {
        const end = maxLength
        const slice = buffered.slice(0, end)
        buffered = buffered.slice(end)
        this.queue(slice)
      }
    },
    function flush (end) {
      if (buffered.length) {
        this.queue(buffered)
        buffered = []
      }

      this.queue(null)
    }
  )
}
