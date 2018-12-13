# Websockets Connector for [Yjs](https://github.com/y-js/yjs) (Client)

With the websockets connector you can set up a central server that saves changes and communicates with clients (see [y-websockets-server](https://github.com/y-js/y-websockets-server)).
This option is very similar to other shared editing frameworks that require a central server. Because the websocket connector is build on top of [socket.io](http://socket.io),
this connector is a rock solid choice if you require high reliability.

* Extremely reliable
* Very easy to use
* Some server load
* You can set up a central server that persists changes
* Falls back to http-communication, if websockets are not supported
* Works with nodejs and in the browser


## Use it!
Retrieve this with bower or npm. Note: You need to set up a 
[y-websockets-server](https://github.com/y-js/y-websockets-server) that acts as a central server.
You should use the default connection endpoint only for testing! If the `url` property is not set,
the default connection endpoint is chosen (provided by the i5 chair of informatics, RTWH University).

##### NPM
```
npm install y-websockets-client --save
```

##### Bower
```
bower install y-websockets-client --save
```

### Example

```
Y({
  db: {
    name: 'memory' // use the memory db adapter
  },
  connector: {
    name: 'websockets-client', // use the websockets-client connector
    room: 'Textarea-example-dev',
    // socket: io('http://localhost:1234') // Pass socket.io object to use
    // url: http://localhost:1234 // the connection endpoint (see y-websockets-server)
    // if `url` is not set, the default connection endpoint is chosen
    // (provided by the i5 chair of computer science, RTWH University)
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
