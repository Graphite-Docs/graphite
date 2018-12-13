'use strict'

module.exports = parse

function parse (_uri) {
  let uri = _uri.trim()
  if (uri.charAt(0) === '?') {
    uri = uri.substring(1)
  }

  const parts = uri.split('&').map(qsPart)
  return qsMergeParts(parts)
}

function qsPart (part) {
  const parts = part.split('=')
  const key = decodeURIComponent(parts[0])
  const value = qsPartToBuffer(parts[1])
  return {
    key: key,
    value: value
  }
}

function qsPartToBuffer (part) {
  try {
    return Buffer.from(decodeURIComponent(part))
  } catch (err) {
    return qsPartToBufferTheHardWay(part)
  }
}

function qsPartToBufferTheHardWay (part) {
  const results = []
  for (let index = 0; index < part.length; index++) {
    const char = part.charAt(index)
    if (char === '%') {
      const code = parseInt(part.substring(index + 1, index + 3), 16)
      results.push(code)
      index += 2
    } else {
      results.push(decodeURIComponent(char).charCodeAt(0))
    }
  }
  return Buffer.from(results)
}

function qsMergeParts (parts) {
  const result = {}
  parts.forEach((part) => {
    const key = part.key
    if (result.hasOwnProperty(key)) {
      result[key] = [result[key], part.value]
    } else {
      result[key] = part.value
    }
  })
  return result
}
