# quill-cursors
A multi cursor module for [Quill](https://github.com/quilljs/quill) text editor.

(Fancy working with these libraries to help build an amazing product for self-publishing authors? Don't miss out [Reedsy current job openings](https://angel.co/reedsy/jobs).)

## Install

Install `quill-cursors` module through npm:

```bash
$ npm install quill-cursors --save
```

## Usage

To include `quill-cursors` in your Quill project, simply add the stylesheet and all the Javascripts to your page. The module is built as a [UMD module](https://github.com/umdjs/umd) falling back to expose a `QuillCursors` global. Keep in mind you should register this module on Quill as below before usage.

```html
<head>
  ...
  <link rel="stylesheet" href="/path/to/quill-cursors.css">
  ...
</head>
<body>
  ...
  <div id="editor-container"></div>
  ...
  <script src="/path/to/quill.min.js"></script>
  <script src="/path/to/quill-cursors.min.js"></script>
  <script>
    Quill.register('modules/cursors', QuillCursors);

    var editor = new Quill('#editor-container', {
      modules: {
        cursors: true // or with options object, cursors: { ... }
      }
    });
  </script>

</body>
```

To set a cursor call:

```javascript
editor.getModule('cursors').set({
  id: '1',
  name: 'User 1',
  color: 'red',
  range: range
});
```

**Please note**, that this module only handles the cursors drawing on a Quill instance. You must produce some additional code to handle actual cursor sync in a real scenario. So, it's assumed that:

* You should implement some sort of server-side code/API (or another suitable mechanism) to maintain the cursors information synced across clients/Quill instances;
* This module is responsible for automatically updating the cursors configured on the module when there is a `'text-change'` event - so if the client/instance contents are updated locally or through a `updateContents()` call, one shouldn't be needing to do anything to update/shift the displayed cursors;
* It is expected for the clients/instances to send updated cursor/range information on `selection-change` events;​
* Additionally, the client code should guarantee:
  * The drawing the initial cursors for all the active connections at init;
  * Updating a cursor with move/set when an cursor update is received;
  * Calling remove cursor when receiving a cursor/client disconnection;

For a simple local-based implementation, check [the included example](example).

## API

### Config Options

To enable the module (and rely on the default settings) you just need to set the `modules.cursors` property to `true` on the Quill options object. For more custom config you can use the following options:

```javascript
var editor = new Quill('#editor-container', {
  modules: {
    cursors: {
      template: '<div class="custom-cursor">...</div>',
      autoRegisterListener: false, // default: true
      hideDelay: 500, // default: 3000
      hideSpeed: 0 // default: 400
    }
  }
});
```

#### `template` - String

Option to add a custom HTML string to customise the cursor template. Check the default template on the code.

#### `autoRegisterListener` - Boolean (default: `true`)

Option to define if the module should register the `text-change` handler on init, or if it will relegate that responsibility to the dependent client code. Clients can register this handler manually by calling `editor.getModule('cursors').registerTextChangeListener()`.

#### `hideDelay` - String (default: `3000`)

Option to define the delay in milliseconds for the cursor flag hiding transition.

#### `hideSpeed` - String (default: `400`)

Option to define the speed in milliseconds for the cursor flag hiding transition.

### Public Methods/Interface

Public methods of a module instance. You can get the module instance through `var cursors = editor.getModule('cursors') `.

#### `cursors.registerTextChangeListener()`

Registers the necessary internal `text-change` event handler to take care of cursors shifting when new updates happen on the Quill editor.

#### `cursors.clearCursors()`

Removes and clears all cursors.

#### `cursors.moveCursor(userId, range)`

Moves a specified cursor to a specified range. Does nothing if a cursors with the specified id isn't found. Parameters:

* `userId` - the id/user id of the cursor being updated;
* `range` - the new range of the cursor, as returned by `editor.getSelection()`;

#### `cursors.removeCursor(userId)`

Removes the specified cursor. Parameters:

* `userId` - the id/user id of the cursor being updated;

#### `cursors.setCursor(userId, range, name, color)`

Adds and sets/registers a new cursor with the specified data - range, name and color. If the cursor doesn't yet exist a new one will be initted and placed on the editor. If the cursor already exists sets _only_ the new range for that new cursor - same as `cursors.moveCursor(userId, range)`. Parameters:

* `userId` - the id/user id of the cursor being updated;
* `range` - the new range of the cursor, as returned by `editor.getSelection()`;
* `name` - the display name for the user of this cursor;
* `color` - the color of this cursor (any valid CSS color as a string will work);

#### `cursors.shiftCursors(index, length)`

Move/shift _all_ cursors _on or after_ specified index by the specified length. Parameters:

* `index` - the index from which to upgrade cursors from, all cursors _on or after_ this index will be shifted;
* `length` - the amount of shifting, can be positive or negative;

#### `cursors.update()`

Force an update/refresh of _all_ cursors registered on the module.

## Development

Run `npm run build` to package a build and `npm run dev` to build, start the example webserver and watch for changes.

## TODO

A few things that can be improved:

* Add tests
* Improve bundling, namely on styles/add minified styles
* EventEmitter events?

## License

This code is available under the [MIT license](LICENSE-MIT.txt).
