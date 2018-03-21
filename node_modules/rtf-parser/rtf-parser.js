'use strict'
const Transform = require('readable-stream').Transform

class RTFParser extends Transform {
  constructor () {
    super({objectMode: true})
    this.text = ''
    this.controlWord = ''
    this.controlWordParam = ''
    this.hexChar = ''
    this.parserState = this.parseText
    this.char = 0
    this.row = 1
    this.col = 1
  }
  _transform (buf, encoding, done) {
    const text = buf.toString('ascii')
    for (let ii = 0; ii < text.length; ++ii) {
      ++this.char
      if (text[ii] === '\n') {
        ++this.row
        this.col = 1
      } else {
        ++this.col
      }
      this.parserState(text[ii])
    }
    done()
  }
  _flush (done) {
    this.emitText()
    done()
  }
  parseText (char) {
    if (char === '\\') {
      this.parserState = this.parseEscapes
    } else if (char === '{') {
      this.emitStartGroup()
    } else if (char === '}') {
      this.emitEndGroup()
    } else if (char === '\x0A' || char === '\x0D') {
      // cr/lf are noise chars
    } else {
      this.text += char
    }
  }

  parseEscapes (char) {
    if (char === '\\' || char === '{' || char === '}') {
      this.text += char
      this.parserState = this.parseText
    } else {
      this.parserState = this.parseControlSymbol
      this.parseControlSymbol(char)
    }
  }
  parseControlSymbol (char) {
    if (char === '~') {
      this.text += '\u00a0' // nbsp
      this.parserState = this.parseText
    } else if (char === '-') {
      this.text += '\u00ad' // soft hyphen
    } else if (char === '_') {
      this.text += '\u2011' // non-breaking hyphen
    } else if (char === '*') {
      this.emitIgnorable()
      this.parserState = this.parseText
    } else if (char === "'") {
      this.parserState = this.parseHexChar
    } else if (char === '|') { // formula character
      this.emitFormula()
      this.parserState = this.parseText
    } else if (char === ':') { // subentry in an index entry
      this.emitIndexSubEntry()
      this.parserState = this.parseText
    } else if (char === '\x0a') {
      this.emitEndParagraph()
      this.parserState = this.parseText
    } else if (char === '\x0d') {
      this.emitEndParagraph()
      this.parserState = this.parseText
    } else {
      this.parserState = this.parseControlWord
      this.parseControlWord(char)
    }
  }
  parseHexChar (char) {
    if (/^[A-Fa-f0-9]$/.test(char)) {
      this.hexChar += char
      if (this.hexChar.length >= 2) {
        this.emitHexChar()
        this.parserState = this.parseText
      }
    } else {
      this.emitError(`Invalid character "${char}" in hex literal.`)
      this.parserState = this.parseText
    }
  }
  parseControlWord (char) {
    if (char === ' ') {
      this.emitControlWord()
      this.parserState = this.parseText
    } else if (/^[-\d]$/.test(char)) {
      this.parserState = this.parseControlWordParam
      this.controlWordParam += char
    } else if (/^[A-Za-z]$/.test(char)) {
      this.controlWord += char
    } else {
      this.emitControlWord()
      this.parserState = this.parseText
      this.parseText(char)
    }
  }
  parseControlWordParam (char) {
    if (/^\d$/.test(char)) {
      this.controlWordParam += char
    } else if (char === ' ') {
      this.emitControlWord()
      this.parserState = this.parseText
    } else {
      this.emitControlWord()
      this.parserState = this.parseText
      this.parseText(char)
    }
  }
  emitText () {
    if (this.text === '') return
    this.push({type: 'text', value: this.text, pos: this.char, row: this.row, col: this.col})
    this.text = ''
  }
  emitControlWord () {
    this.emitText()
    if (this.controlWord === '') {
      this.emitError('empty control word')
    } else {
      this.push({
        type: 'control-word',
        value: this.controlWord,
        param: this.controlWordParam !== '' && Number(this.controlWordParam),
        pos: this.char,
        row: this.row,
        col: this.col
      })
    }
    this.controlWord = ''
    this.controlWordParam = ''
  }
  emitStartGroup () {
    this.emitText()
    this.push({type: 'group-start', pos: this.char, row: this.row, col: this.col})
  }
  emitEndGroup () {
    this.emitText()
    this.push({type: 'group-end', pos: this.char, row: this.row, col: this.col})
  }
  emitIgnorable () {
    this.emitText()
    this.push({type: 'ignorable', pos: this.char, row: this.row, col: this.col})
  }
  emitHexChar () {
    this.emitText()
    this.push({type: 'hexchar', value: this.hexChar, pos: this.char, row: this.row, col: this.col})
    this.hexChar = ''
  }
  emitError (message) {
    this.emitText()
    this.push({type: 'error', value: message, row: this.row, col: this.col, char: this.char, stack: new Error().stack})
  }
  emitEndParagraph () {
    this.emitText()
    this.push({type: 'end-paragraph', pos: this.char, row: this.row, col: this.col})
  }
}

module.exports = RTFParser
