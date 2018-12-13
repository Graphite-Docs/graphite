'use strict'

const semver = require('semver')

/**
 * Match protocols using semver `~` matching.
 *
 * @param {string} myProtocol
 * @param {string} senderProtocol
 * @param {function(Error, boolean)} callback
 * @returns {undefined}
 * @type {matchHandler}
 */
function matchSemver (myProtocol, senderProtocol, callback) {
  const mps = myProtocol.split('/')
  const sps = senderProtocol.split('/')
  const myName = mps[1]
  const myVersion = mps[2]

  const senderName = sps[1]
  const senderVersion = sps[2]

  if (myName !== senderName) {
    return callback(null, false)
  }
  // does my protocol satisfy the sender?
  const valid = semver.satisfies(myVersion, '~' + senderVersion)

  callback(null, valid)
}

module.exports = matchSemver
