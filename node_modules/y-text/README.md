
# Text Type for [Yjs](https://github.com/y-js/yjs)

Use the Y.Text type to share text content. The shared content can be bound to
[Ace](https://ace.c9.io/), [CodeMirror](https://codemirror.net/), [Monaco](https://github.com/Microsoft/monaco-editor), or any HTML
input element (e.g. &lt;input&gt;, &lt;textarea&gt;, any element that has the [contenteditable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable) property)

```
// bind text to the first p element that is contenteditable
y.share.text.bind(document.querySelector("p[contenteditable]"))
```

## Use it!
Retrieve this with bower or npm.

##### Bower
```
bower install y-text --save
```

##### NPM
```
npm install y-text y-array --save
```

This type depends on [y-array](https://github.com/y-js/y-array). So you have to
extend Yjs in the right order:

```javascript
var Y = require('yjs')
require('y-array')(Y)
require('y-text')(Y)
```

### Text Object

##### Reference
* .insert(position, string)
  * Insert a string at a position
* .delete(position, length)
  * Delete a substring. The *length* parameter is optional and defaults to 1
* .get(i)
  * Retrieve the i-th character
* .toString()
  * Return the content as a String
* .bindTextarea(htmlElement)
  * Supports textareas, inputs, and any contenteditable element
* .bindCodeMirror(codemirror)
  * Bind shared content to a [CodeMirror](https://codemirror.net/) instance
* .bindAce(aceEditor)
  * Bind shared content to an [Ace](https://ace.c9.io/) instance
  * `options` supports the following properties:
    * **aceClass**: In case `ace` is not defined on the global object
    * **aceRequire**: An alternative method to require Ace modules (default is
      `aceClass.require`). Must work similar to `ace.require`
* .bindMonaco(editor)
  * Bind shared content to a [Monaco](https://github.com/Microsoft/monaco-editor) editor
* .bind(editor, options) - *deprecated*
  * Tries to detect the editor, and applies the arguments to `.bind[editor](..)`
  * `.bind*(editor)` does not preserve the existing value of the bound editor.
* .unbindTextarea(htmlElement)
  * Remove bindings to a html element
* .unbindCodeMirror(codemirror)
  * Remove bindings to a CodeMirror instance
* .unbindAce(aceEditor)
  * Remove bindings to a Ace instance
* .unbindMonaco(editor)
  * Remove bindings to a Monaco instance
* .unbindTextareaAll()
  * Remove all bindings to html elements
* .unbindCodeMirrorAll()
  * Remove all bindings to CodeMirror instances
* .unbindAceAll()
  * Remove all bindings to Ace instances
* .unbindMonacoAll()
  * Remove all Monaco editor bindings
* .unbindAll()
  * Remove all bindings
* .observe(f)
  * The observer is called whenever something on this text changed. (throws
    insert, and delete events)
* .unobserve(f)
  * Delete an observer

# A note on intention preservation
If two users insert something at the same position concurrently, the content
that was inserted by the user with the higher user-id will be to the right of
the other content. In the OT world we often speak of *intention preservation*,
which is very loosely defined in most cases. This type has the following notion
of intention preservation: When a user inserts content *c* after a set of
content *C_left*, and before a set of content *C_right*, then *C_left* will be
always to the left of c, and *C_right* will be always to the right of *c*. This
property will also hold when content is deleted or when a deletion is undone.

# A note on time complexities
* .insert(position, contents)
  * O(position + |contents|)
* .toString()
  * O(this.length)
* Apply an insert operation from another user
  * Yjs does not transform against operations that do not conflict with each
    other.
  * An operation conflicts with another operation if it intends to be inserted
    at the same position.
  * Overall worst case complexety: O(|conflicts|!)


## Contribution
We thank [@NathanaelA](https://github.com/nathanaela) who sponsored the bindings to the Monaco editor!


## License
Yjs is licensed under the [MIT License](./LICENSE).

<kevin.jahns@rwth-aachen.de>
