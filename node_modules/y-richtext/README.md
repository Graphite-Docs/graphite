
# Rich Text type for [Yjs](https://github.com/y-js/yjs)
The fabolous feature of y-richtext is that you can bind it to a [Quill](quilljs.com) instance (> v1.0.0) in order to enable collaborative richtext editing.

## Use it!

### Bower
Retrieve y-richtext and [Quill](quilljs.com) Editor with bower.

```
bower install y-richtext quill --save
```

### NPM

```
npm install y-richtext y-array quill --save
```

This type depends on [y-array](https://github.com/y-js/y-array). So you have to extend Yjs in the right order:

```javascript
var Y = require('yjs')
require('y-array')(Y)
require('y-richtext')(Y)
```

## Example
```javascript
Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client',
    room: 'richtext-example'
  },
  share: {
    richtext: 'Richtext' // y.share.richtext is of type Y.Richtext
  }
}).then(function (y) {
  window.yquill = y

  // create quill element
  window.quill = new Quill('#editor', {
    modules: {
      'toolbar': { container: '#toolbar' },
      'link-tooltip': true
    },
    theme: 'snow'
  })
  // bind quill to richtext type
  y.share.richtext.bindQuill(window.quill)
})
```

### RichText Object

##### Reference
* .bind(editor)
  * Bind this type to an rich text editor. (Currently, only QuillJs is supported)
  * `.bind(editor)` does not preserve the existing value of the bound editor
* .bindQuill(quill)
  * Explicitely bind a Quill editor
* unbindQuill(quill)
  * Remove binding
* unbindQuillAll()
  * Remove all quill bindings
* .insert(position, string)
  * Insert text at a position
* .delete(position, length)
  * Delete text
* select(from, to, attrName, attrValue)
  * Assign meaning to a selection of text (application depending to what you bind, this can assign text to be bold, italic, ..). Set null to remove selection.
* toString()
  * Get the string representation of this type (without selections)
* toDelta()
  * Convert internal structure to a Quill delta http://quilljs.com/docs/deltas/
* applyDelta()
  * Apply a Quill delta http://quilljs.com/docs/deltas/


## Contribution
We thank [Linagora](https://www.linagora.com/) who sponsored this work, and agreed to publish it as Open Source.

## Changelog

### 8.2.1
* support for Quill@^1.0.0-rc.2
* relies on Yjs@^12.0.0 

## License
Yjs and the RichText type are licensed under the [MIT License](./LICENSE).

- Corentin Cadiou <corentin.cadiou@linagora.com>
- Kevin Jahns <kevin.jahns@rwth-aachen.de>
