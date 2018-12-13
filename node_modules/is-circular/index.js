var Node = require('./lib/node')

module.exports = isCircular

/**
 * checks whether the object is circular
 * @param  {object}  obj - object to check circularity for
 * @return {Boolean} true if obj is circular, false if it is not
 */
function isCircular (obj) {
  if (!(obj instanceof Object)) {
    throw new TypeError('"obj" must be an object (or inherit from it)')
  }
  return _isCircular(obj)
}

/**
 * @private
 * checks whether the object is circular
 * @param  {object}  obj - object to check circularity for
 * @param  {Node}    parentList - linked-list that contains all the object's parents
 * @return {Boolean} true if obj is circular, false if it is not
 */
function _isCircular (obj, parentList) {
  parentList = new Node(obj, parentList)

  // breadth-first search for circular object
  for (var key in obj) {
    var val = obj[key]
    if (val instanceof Object) {
      if (parentList.contains(val) || _isCircular(val, parentList)) {
        return true
      }
    }
  }

  return false
}
