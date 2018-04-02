var redis = require('redis')
var Shorten = require('../lib');
var redisClient = redis.createClient();
var shorten = new Shorten(redisClient);

for (var i = 0; i < 1000; i++){
  shorten.nextId(function(err, id){
      console.log(id);
    });
}

for (var i = 0; i < 1000; i++){
  shorten.nextIdEx(function(err, id){
      console.log(id);
    });
}

for (var i = 0; i < 1000; i++){
  shorten.nextId('topic', function(err, id){
      console.log(id);
    });
}

for (var i = 0; i < 1000; i++){
  shorten.nextIdEx('topic', function(err, id){
      console.log(id);
    });
}
