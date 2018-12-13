var fs = require( "fs" );
var wordpress = require( "../" );

var client = wordpress.createClient({
	url: "my-site.com",
	username: "admin",
	password: "secret"
});

// "Aurora Borealis" by Frederic Edwin Church
// Licensed under Public Domain via Wikimedia Commons
var filename = "aurora-borealis.jpg";
var file = fs.readFileSync( filename );
client.uploadFile({
	name: filename,
	type: "image/jpg",
	bits: file
}, function( error, data ) {
	console.log( arguments );
});
