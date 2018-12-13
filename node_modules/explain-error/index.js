
function getStack(err) {
  if(err.stack && err.name && err.message)
    return err.stack.substring(err.name.length + 3 + err.message.length)
      .split('\n')
  else if(err.stack)
    return err.stack.split('\n')
}

function removePrefix (a, b) {
  return a.filter(function (e) {
    return !~b.indexOf(e)
  })
}

var explain = module.exports = function (err, message) {
  if(!(err.stack && err.name && err.message)) {
    console.error(new Error('stackless error'))
    return err
  }

  var _err = new Error(message)
  var stack = removePrefix(getStack(_err).slice(1), getStack(err)).join('\n')

  _err.__proto__ = err

  _err.stack =
    _err.name + ': ' + _err.message + '\n' +
    stack + '\n  ' + err.stack

  return _err
}



