var wordpress = require( "../" );

var client = wordpress.createClient({
	url: "my-site.com",
	username: "admin",
	password: "secret"
});

client.newPost({
	title: "My Second Post",
	content: "Publishing to WordPress from node.js sure is fun!",
	status: "publish",
	termNames: {
		"category": ["Javascript", "Node"],
		"post_tag": ["api", "fun", "js"]
	}
}, function( error, data ) {
	console.log( arguments );
});
