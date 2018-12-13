module.exports = createIsLink

function createIsLink (resolve) {
  return function isLink (block, path, callback) {
    resolve(block, path, (err, result) => {
      if (err) {
        return callback(err)
      }

      if (result.remainderPath.length > 0) {
        return callback(new Error('path out of scope'))
      }

      if (typeof result.value === 'object' && result.value['/']) {
        callback(null, result.value)
      } else {
        callback(null, false)
      }
    })
  }
}
