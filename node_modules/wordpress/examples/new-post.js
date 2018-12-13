var wordpress = require( "../" );

var client = wordpress.createClient({
	url: "my-site.com",
	username: "admin",
	password: "secret"
});

client.newPost({
	title: "My First Post",
	content: "Controlling WordPress from node.js sure is fun!"
}, function( error, data ) {
	console.log( arguments );
});
