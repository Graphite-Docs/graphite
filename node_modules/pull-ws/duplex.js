var source = require('./source')
var sink = require('./sink')

module.exports = duplex

function duplex (ws, opts) {
  var req = ws.upgradeReq || {}
  if(opts && opts.binaryType)
    ws.binaryType = opts.binaryType
  else if(opts && opts.binary)
    ws.binaryType = 'arraybuffer'
  return {
    source: source(ws, opts && opts.onConnect),
    sink: sink(ws, opts),

    //http properties - useful for routing or auth.
    headers: req.headers,
    url: req.url,
    upgrade: req.upgrade,
    method: req.method
  };
};

