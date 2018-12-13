# node-wordpress

A node.js JavaScript client for working with WordPress.

Support this project by [donating on Gratipay](https://gratipay.com/scottgonzalez/).

Requires WordPress 3.4 or newer (uses the [WordPress XML-RPC API](http://codex.wordpress.org/XML-RPC_WordPress_API)).



## Installation

```
npm install wordpress
```



## Usage

```js
var wordpress = require( "wordpress" );
var client = wordpress.createClient({
	url: "my-site.com",
	username: "admin",
	password: "secret"
});

client.getPosts(function( error, posts ) {
	console.log( "Found " + posts.length + " posts!" );
});
```

More usage examples can be found in the `examples` directory.

### Full Site Synchronization

Looking for a way to manage your WordPress site without writing a bunch of code? Use [Gilded WordPress](https://github.com/scottgonzalez/gilded-wordpress) to easily synchronize your entire site from a local directory.



## API

*Note: In order to provide a slightly nicer API, the XML-RPC field names have been mapped to CamelCase names. In some cases, the names are also altered because the original names are awkward. See [the Fields section](#fields) for a list of fields by type.*

### Client

#### wordpress.createClient( settings )

Creates a new client instance.

* `settings`: A hash of settings that apply to all requests for the new client.
  * `username`: The username for the WordPress account.
  * `password`: The password for the WordPress account.
  * `url`: The URL for the WordPress install.
  * `host` (optional): The actual host to connect to if different from the URL, e.g., when deploying to a local server behind a firewall.
  * `blogId` (optional; default: `0`): The blog ID for the WordPress install.
  * `rejectUnauthorized` (optional; default: `true`): A boolean indicating whether Node.js should automatically reject clients with invalid certificates. See [tls.createSecurePair()](https://nodejs.org/api/tls.html#tls_tls_createsecurepair_context_isserver_requestcert_rejectunauthorized_options) in Node's documentation.
  * `basicAuth` (optional): An object holding HTTP basic authentication credentials.
    * `username`: The username for the HTTP basic auth.
    * `password`: The password for the HTTP basic auth.

#### wordpress.Client

The constructor used for client connections. Useful for creating extensions.

### Posts

#### client.getPost( id [, fields], callback )

Gets a post by ID.

* `id`: The ID of the post to get.
* `fields` (optional): An array of fields to return.
* `callback` (`function( error, post )`): A callback to invoke when the API call is complete.
  * `post`: An object containing the post data.

#### client.getPosts( [filter] [, fields], callback )

Gets all posts, optionally filtered.

* `filter` (optional): A hash of key/value pairs for filtering which posts to get.
* `fields` (optional): An array of fields to return.
* `callback` (`function( error, posts )`): A callback to invoke when the API call is complete.
  * `posts`: An array containing the posts.

#### client.newPost( data, callback )

Creates a new post.

* `data`: The data for the new post.
* `callback` (`function( error, id )`): A callback to invoke when the API call is complete.
  * `id`: The ID of the new post.

#### client.editPost( id, data, callback )

Edits an existing post.

* `id`: The ID of the post to edit.
* `data`: The data to update on the post.
* `callback` (`function( error )`): A callback to invoke when the API call is complete.

#### client.deletePost( id, callback )

Deletes a post.

*NOTE:* Deleting a post may move it to the trash and then deleting a second time will actually delete.

* `id`: The ID of the post to delete.
* `callback` (`function( error )`): A callback to invoke when the API call is complete.

#### client.getPostType( name, [, fields], callback )

Gets a post type by name.

* `name`: The name of the post type to get.
* `fields` (optional): An array of fields to return.
* `callback` (`function( error, postType )`): A callback to invoke when the API call is complete.
  * `postType`: An object containing the post type data.

#### client.getPostTypes( [filter], [, fields], callback )

Gets all post types.

* `filter` (optional): A hash of key/value pairs for filtering which posts types to get.
* `fields` (optional): An array of fields to return.
* `callback` (`function( error, postTypes )`): A callback to invoke when the API call is complete.
  * `postTypes`: An array containing the post types.

### Taxonomies

#### client.getTaxonomy( name, callback )

Gets a taxonomy by name.

* `name`: The name of the taxonomy to get.
* `callback` (`function( error, taxonomy )`): A callback to invoke when the API call is complete.
  * `taxonomy`: An object containing the taxonomy data.

#### client.getTaxonomies( callback )

Gets all taxonomies.

* `callback` (`function( error, taxonomies )`): A callback to invoke when the API call is complete.
  * `taxonomies`: An array containing the taxonomies.

#### client.getTerm( taxonomy, id, callback )

Gets a taxonomy term by ID.

* `taxonomy`: The name fo the taxonomy the term belongs to.
* `id`: The ID of the term to get.
* `callback` (`function( error, term )`): A callback to invoke when the API call is complete.
  * `term`: An object containing the taxonomy term data.

#### client.getTerms( taxonomy [, fields], callback )

Gets all taxonomy terms.

* `taxonomy`: The name fo the taxonomy the term belongs to.
* `fields` (optional): An array of fields to return.
* `callback` (`function( error, terms )`): A callback to invoke when the API call is complete.
  * `terms`: An array containing the taxonomy terms.

#### client.newTerm( data, callback )

Creates a new taxonomy term.

* `data`: The data for the new taxonomy term.
* `callback` (`function( error, id )`): A callback to invoke when the API call is complete.
  * `id`: The ID of the new taxonomy term.

#### client.editTerm( id, data, callback )

Edits an existing taxonomy term.

* `id`: The ID of the taxonomy term to edit.
* `data`: The data to update on the taxonomy.
* `callback` (`function( error )`): A callback to invoke when the API call is complete.

#### client.deleteTerm( taxonomy, id, callback )

Deletes a taxonomy term.

* `taxonomy`: The name fo the taxonomy the term belongs to.
* `id`: The ID of the taxonomy term to delete.
* `callback` (`function( error )`): A callback to invoke when the API call is complete.

### Media

#### client.getMediaItem( id, callback )

Gets a piece of media by ID.

* `id`: The ID of the piece of media to get.
* `callback` (`function( error, media )` ): A callback to invoke when the API call is complete.

#### client.getMediaLibrary( [filter], callback )

* `filter` (optional): A hash of key/value pairs for filtering which posts to get.
* `callback` (`function( error, media )` ): A callback to invoke when the API call is complete.

#### client.uploadFile( data, callback )

Uploads a file to Wordpress.

* `data`: The data for the file to upload.
  * `name`: The filename.
  * `type`: The file MIME type, e.g `img/jpg`.
  * `bits`: Binary data.
  * `overwrite` (optional): Whether this file should overwrite any existing file of the same name.
  * `postId` (optional): Which post to assign the attachment to.
* `callback` (`function( error, file )`): A callback to invoke when the API call is complete.
  * `file`: An object containing the file data.

### Utilities

#### client.listMethods( callback )

Gets a list of all avaialble methods.

* `callback` (`function( error, methods )`): A callback to invoke when the API call is complete.
  * `methods`: An array of methods.

#### client.call( method [, args... ], callback )

Invokes a method.

* `method`: The method to call.
* `args` (optional): Arguments to pass to the method.
* `callback` (`function( error [, data] )`): A callback to invoke when the API call is complete.
  * `data`: Data returned by the method.

#### client.authenticatedCall( method [, args... ], callback )

Invokes a method with the username and password provided by the client.

* `method`: The method to call.
* `args` (optional): Arguments to pass to the method.
* `callback` (`function( error [, data] )`): A callback to invoke when the API call is complete.
* `data`: Data returned by the method.

### Fields

#### Files

* name
* type
* bits
* overwrite
* postId

#### Labels

* addNewItem
* addOrRemoveItems
* allItems
* chooseFromMostUsed
* editItem
* menuName
* name
* nameAdminBar
* newItemName
* parentItem
* parentItemColon
* popularItems
* searchItems
* separateItemsWithCommas
* singularName
* updateItem
* viewItem

#### Posts

* author
* commentStatus
* content
* customFields
* date
* excerpt
* format
* id
* link
* modified
* menuOrder
* name
* pageTemplate
* parent
* password
* pingStatus
* status
* sticky
* terms
* termNames
* thumbnail
* title
* type

#### Post Types

* cap
* capabilityType
* description
* _editLink
* excludeFromSearch
* hasArchive
* hierarchical
* label
* labels
* mapMetaCap
* menuIcon
* menuPosition
* name
* "public
* publiclyQuerably
* queryVar
* rewrite
* showInAdminBar
* showInMenu
* showInNavMenus
* showUi
* supports
* taxonomies

#### Post Type Capabilities

* deleteOthersPosts
* deletePost
* deletePosts
* deletePrivatePosts
* deletePublishedPosts
* editOthersPosts
* editPost
* editPosts
* editPrivatePosts
* editPublishedPosts
* publishPosts
* read
* readPost
* readPrivatePosts

#### Taxonomies

* cap
* hierarchical
* name
* label
* labels
* objectType
* public
* queryVar
* rewrite
* showInNavMenus
* showTagCloud
* showUi

#### Taxanomy Capabilities

* assignTerms
* deleteTerms
* editTerms
* manageTerms

#### Terms

* count
* description
* name
* parent
* slug
* taxonomy
* termId
* termTaxonomyId

#### Media

* attachmentId
* caption
* date
* description
* link
* metadata
  * file
  * height
  * imageMeta
    * aperture
    * camera
    * caption
    * copyright
    * createdTimestamp
    * credit
    * focalLength
    * iso
    * keywords
    * orientation
    * shutterSpeed
    * title
  * sizes
    * file
    * height
    * mimeType
    * width
  * width
* parent
* thumbnail
* title
* type




## License

Copyright Scott González. Released under the terms of the MIT license.

---

Support this project by [donating on Gratipay](https://gratipay.com/scottgonzalez/).
