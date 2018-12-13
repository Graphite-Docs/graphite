var distance = require('./')

var dist1 = distance(new Buffer('foo'), new Buffer('bar'))
var dist2 = distance(new Buffer('foo'), new Buffer('baz'))

console.log(distance.gt(dist1, dist2))
