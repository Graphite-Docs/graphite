# In-Memory database adapter for [Yjs](https://github.com/y-js/yjs)

Use the Memory database adapter to store your shared data efficiently in-memory. The next time you join the session, your changes will be lost

* Supported by all browsers
* Very fast access

## Use it!
Install this with bower or npm.

##### Bower
```
bower install y-memory --save
```

##### NPM
```
npm install y-memory --save
```

### Example

```
Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client', // use the websockets connector
    room: 'Textarea-example-dev'
  },
  share: {
    textarea: 'Text' // y.share.textarea is of type Y.Text
  }
}).then(function (y) {
  // bind the textarea to a shared text element
  y.share.textarea.bind(document.getElementById('textfield'))
}
```

## License
Yjs is licensed under the [MIT License](./LICENSE).

<kevin.jahns@rwth-aachen.de>