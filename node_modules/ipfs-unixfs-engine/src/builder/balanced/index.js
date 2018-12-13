'use strict'

const balancedReducer = require('./balanced-reducer')

const defaultOptions = {
  maxChildrenPerNode: 174
}

module.exports = function (reduce, _options) {
  const options = Object.assign({}, defaultOptions, _options)
  return balancedReducer(reduce, options)
}
