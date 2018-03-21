'use strict'
const RTFParser = require('./rtf-parser.js')
const RTFDocument = require('./rtf-document.js')
const RTFInterpreter = require('./rtf-interpreter.js')

module.exports = parse
parse.string = parseString
parse.stream = parseStream

function parseString (string, cb) {
  parse(cb).end(string)
}

function parseStream (stream, cb) {
  stream.pipe(parse(cb))
}

function parse (cb) {
  let errored = false
  const errorHandler = err => {
    if (errored) return
    errored = true
    parser.unpipe(interpreter)
    interpreter.end()
    cb(err)
  }
  const document = new RTFDocument()
  const parser = new RTFParser()
  parser.once('error', errorHandler)
  const interpreter = new RTFInterpreter(document)
  interpreter.on('error', errorHandler)
  interpreter.on('finish', () => cb(null, document))
  parser.pipe(interpreter)
  return parser
}

