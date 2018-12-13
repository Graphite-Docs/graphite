'use strict'

module.exports = {
  karma: {
    files: [{
      pattern: 'test/test-data/**/*',
      watched: false,
      served: true,
      included: false
    }]
  }
}