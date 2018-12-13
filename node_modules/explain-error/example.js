var explain = require('./')

function explainedError(cb) {
  require('fs').stat('neoatuhrcoahkrcophkr', function (err) {
    if(err) cb(explain(err, 'asked for a file that certainly did not exist'))
    else cb()
  })
}

explainedError(function (err) {
  throw explain(err, 'called an function that was expected to fail')
})

