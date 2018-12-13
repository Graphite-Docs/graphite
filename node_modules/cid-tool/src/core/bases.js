'use strict'

const multibase = require('multibase')

module.exports = function bases () {
  return multibase.names.map((name, i) => {
    const code = multibase.codes[i]
    return { name, code }
  })
}
