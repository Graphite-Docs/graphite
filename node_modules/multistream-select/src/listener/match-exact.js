'use strict'

/**
 * Match protocols exactly.
 *
 * @param {string} myProtocol
 * @param {string} senderProtocol
 * @param {function(Error, boolean)} callback
 * @returns {undefined}
 * @type {matchHandler}
 */
function matchExact (myProtocol, senderProtocol, callback) {
  const result = myProtocol === senderProtocol
  callback(null, result)
}

module.exports = matchExact
