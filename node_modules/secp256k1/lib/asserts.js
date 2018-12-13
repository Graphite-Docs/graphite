var objToString = Object.prototype.toString

exports.checkTypeBuffer = function (obj, msg) {
  if (!Buffer.isBuffer(obj)) {
    throw TypeError(msg)
  }
}

exports.checkTypeBoolean = function (obj, msg) {
  if (objToString.call(obj) !== '[object Boolean]') {
    throw TypeError(msg)
  }
}

exports.checkTypeFunction = function (obj, msg) {
  if (objToString.call(obj) !== '[object Function]') {
    throw TypeError(msg)
  }
}

exports.checkTypeNumber = function (obj, msg) {
  if (objToString.call(obj) !== '[object Number]') {
    throw TypeError(msg)
  }
}

exports.checkTypeArray = function (obj, msg) {
  if (!Array.isArray(obj)) {
    throw TypeError(msg)
  }
}

exports.checkBufferLength = function (buffer, length, msg) {
  if (buffer.length !== length) {
    throw RangeError(msg)
  }
}

exports.checkBufferLength2 = function (buffer, length1, length2, msg) {
  if (buffer.length !== length1 && buffer.length !== length2) {
    throw RangeError(msg)
  }
}

exports.checkLengthGTZero = function (obj, msg) {
  if (obj.length === 0) {
    throw RangeError(msg)
  }
}

exports.checkNumberInInterval = function (number, x, y, msg) {
  if (number <= x || number >= y) {
    throw RangeError(msg)
  }
}
