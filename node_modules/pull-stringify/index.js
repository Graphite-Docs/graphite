
function def(op, value) {
  return op == null ? value : op
}
module.exports = function stringify (op, cl, sp, indent, stringify) {
  stringify = stringify || JSON.stringify

  op     = def(op, '[')
  cl     = def(cl, ']\n')
  sp     = def(sp, ',\n')
  indent = def(indent, 2)

  var first = true, ended
  return function (read) {
    return function (end, cb) {
      if(ended) return cb(ended)
      read(null, function (end, data) {
        if(!end) {
          var f = first
          first = false
          cb(null, (f ? op : sp)+ stringify(data, null, indent))
        }
        else {
          ended = end
          if(ended !== true) return cb(ended)
          cb(null, first ? op+cl : cl)
        }
      })
    }
  }
}

module.exports.lines =
module.exports.ldjson = function (stringify) {
  return module.exports('','\n','\n', 0, stringify)
}
