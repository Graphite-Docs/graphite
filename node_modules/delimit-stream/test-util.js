
// @param count
//   - if count is an array then its length is the expected count and each value
//     is what the data should be. If the array value is a buffer then it will
//     be checked against the data chunk directly, otherwise the data chunk
//     will be toString()'d before being checked against the array value
//
//   - if count is a number then data content is ignored and only the correct
//     number of data events is checked

exports.shouldStreamDataTimes = function shouldStreamDataTimes(stream, count, cb) {
  var expectedValues = null
  if (Array.isArray(count)) {
    expectedValues = count
    count = count.length
  }
  var outputCount = 0
  stream.on('data', function(data) {
    if (expectedValues) {
      var expectedValue = expectedValues[outputCount]
      if (!Buffer.isBuffer(expectedValue)) data = data.toString()
      data.should.equal(expectedValue)
    }
    outputCount++
  })
  // TODO: Why does "end" event not fire in SplitStream tests?
  stream.on('end', function() {
    outputCount.should.equal(count)
    if (typeof cb === 'function') cb()
  })
}

exports.execEachOnOwnTick = function execEachOnOwnTick(fn, fnArgs, thisBinding) {
  fnArgs.forEach(function(fnArg) {
    process.nextTick(function(){
      fn.apply(thisBinding, fnArg)
    })
  })
}