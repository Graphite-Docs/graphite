'use strict'

const debug = require('debug')

/**
 * Creates a logger for the given subsystem
 *
 * @param {PeerId} [id]
 * @param {string} [subsystem]
 * @returns {debug}
 *
 * @private
 */
exports.logger = (id, subsystem) => {
  const name = ['bitswap']
  if (subsystem) {
    name.push(subsystem)
  }
  if (id) {
    name.push(`${id.toB58String().slice(0, 8)}`)
  }
  const logger = debug(name.join(':'))
  logger.error = debug(name.concat(['error']).join(':'))

  return logger
}
