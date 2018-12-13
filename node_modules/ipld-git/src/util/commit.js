'use strict'

const setImmediate = require('async/setImmediate')
const SmartBuffer = require('smart-buffer').SmartBuffer
const gitUtil = require('./util')

exports = module.exports

exports.serialize = (dagNode, callback) => {
  let lines = []
  lines.push('tree ' + gitUtil.cidToSha(dagNode.tree['/']).toString('hex'))
  dagNode.parents.forEach((parent) => {
    lines.push('parent ' + gitUtil.cidToSha(parent['/']).toString('hex'))
  })
  lines.push('author ' + gitUtil.serializePersonLine(dagNode.author))
  lines.push('committer ' + gitUtil.serializePersonLine(dagNode.committer))
  if (dagNode.encoding) {
    lines.push('encoding ' + dagNode.encoding)
  }
  if (dagNode.mergetag) {
    dagNode.mergetag.forEach(tag => {
      lines.push('mergetag object ' + gitUtil.cidToSha(tag.object['/']).toString('hex'))
      lines.push(tag.text)
    })
  }
  if (dagNode.signature) {
    lines.push('gpgsig -----BEGIN PGP SIGNATURE-----')
    lines.push(dagNode.signature.text)
  }
  lines.push('')
  lines.push(dagNode.message)

  let data = lines.join('\n')

  let outBuf = new SmartBuffer()
  outBuf.writeString('commit ')
  outBuf.writeString(data.length.toString())
  outBuf.writeUInt8(0)
  outBuf.writeString(data)
  setImmediate(() => callback(null, outBuf.toBuffer()))
}

exports.deserialize = (data, callback) => {
  let lines = data.toString().split('\n')
  let res = {gitType: 'commit', parents: []}

  for (let line = 0; line < lines.length; line++) {
    let m = lines[line].match(/^([^ ]+) (.+)$/)
    if (!m) {
      if (lines[line] !== '') {
        setImmediate(() => callback(new Error('Invalid commit line ' + line)))
      }
      res.message = lines.slice(line + 1).join('\n')
      break
    }

    let key = m[1]
    let value = m[2]
    switch (key) {
      case 'tree':
        res.tree = {'/': gitUtil.shaToCid(Buffer.from(value, 'hex'))}
        break
      case 'committer':
        res.committer = gitUtil.parsePersonLine(value)
        break
      case 'author':
        res.author = gitUtil.parsePersonLine(value)
        break
      case 'parent':
        res.parents.push({'/': gitUtil.shaToCid(Buffer.from(value, 'hex'))})
        break
      case 'gpgsig': {
        if (value !== '-----BEGIN PGP SIGNATURE-----') {
          setImmediate(() => callback(new Error('Invalid commit line ' + line)))
        }
        res.signature = {}

        let startLine = line
        for (; line < lines.length - 1; line++) {
          if (lines[line + 1][0] !== ' ') {
            res.signature.text = lines.slice(startLine + 1, line + 1).join('\n')
            break
          }
        }
        break
      }
      case 'mergetag': {
        let mt = value.match(/^object ([0-9a-f]{40})$/)
        if (!mt) {
          setImmediate(() => callback(new Error('Invalid commit line ' + line)))
        }

        let tag = {object: {'/': gitUtil.shaToCid(Buffer.from(mt[1], 'hex'))}}

        let startLine = line
        for (; line < lines.length - 1; line++) {
          if (lines[line + 1][0] !== ' ') {
            tag.text = lines.slice(startLine + 1, line + 1).join('\n')
            break
          }
        }

        if (!res.mergetag) {
          res.mergetag = []
        }

        res.mergetag.push(tag)
      }

        break
      default:
        res[key] = value
    }
  }

  setImmediate(() => callback(null, res))
}
