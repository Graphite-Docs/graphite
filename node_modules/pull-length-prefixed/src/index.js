'use strict'

const encode = require('./encode')
const d = require('./decode')

exports.encode = encode
exports.decode = d.decode
exports.decodeFromReader = d.decodeFromReader
