module.exports = typeof Promise === 'function' ? Promise : require('bluebird')
