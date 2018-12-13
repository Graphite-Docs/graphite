var wordpress = require( "../" );

var client = wordpress.createClient({
	url: "my-site.com",
	username: "admin",
	password: "secret"
});

client.getPosts(function( error, data ) {
	console.log( arguments );
});
