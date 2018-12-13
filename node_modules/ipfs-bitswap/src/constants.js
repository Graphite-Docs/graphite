'use strict'

const SECOND = 1000

module.exports = {
  maxProvidersPerRequest: 3,
  providerRequestTimeout: 10 * SECOND,
  hasBlockTimeout: 15 * SECOND,
  provideTimeout: 15 * SECOND,
  kMaxPriority: Math.pow(2, 31) - 1,
  rebroadcastDelay: 10 * SECOND,
  maxListeners: 1000
}
