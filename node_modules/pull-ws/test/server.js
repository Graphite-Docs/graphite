var WebSocketServer = require('ws').Server;
var mapleTree = require('mapleTree');
var port = process.env.ZUUL_PORT || process.env.PORT || 3000;

module.exports = function () {
var router = new mapleTree.RouteTree();
var wss = new WebSocketServer({ port: port });

  router.define('/read', function(ws) {
    var values = ['a', 'b', 'c', 'd'];
    var timer = setInterval(function() {
      var next = values.shift();
      if (next) {
        ws.send(next);
      }
      else {
        clearInterval(timer);
        ws.close();
      }
    }, 100);
  });

  router.define('/echo', function(ws) {
    ws.on('message', function(data) {
      console.log('received message: ', data);
      ws.send(data);
    });
  });

  wss.on('connection', function(ws) {
    var match = router.match(ws.upgradeReq.url);
    if (match && typeof match.fn == 'function') {
      match.fn(ws);
    }
  });

  return wss

}
