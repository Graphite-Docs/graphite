var stats = (require('./index'))();

stats.on('stats', function(stats) {
	console.log(stats);
});

var t = [];

setInterval(function(){
	t.push(new Date());
	t.push(new Date());
}, 1000);

setInterval(function() {
	t.pop();
});
