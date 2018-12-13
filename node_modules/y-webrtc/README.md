# WebRTC Connector for [Yjs](https://github.com/y-js/yjs)

It propagates document updates directly to all users via WebRTC. While WebRTC is not the most reliable connector, messages are propagated with almost no delay.

* Very fast message propagation (not noticeable)
* Very easy to use
* Very little server load (you still have to set up a [signaling server](http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/))
* Not suited for a large amount of collaborators
* WebRTC is not supported in all browsers, and some have troubles communicating with each other

We provide you with a free signaling server (it is used by default), but in production you should set up your own signaling server. You could use the [signalmaster](https://github.com/DadaMonad/signalmaster) from &yet, which is very easy to set up.

## Use it!
Retrieve this with bower or npm.

##### NPM
```
npm install y-webrtc --save
```

##### Bower
```
bower install y-webrtc --save
```

# Start Hacking
This connector is also a nice starting point to build your own connector. The only 75 SLOCs of code are pretty well documented and understandable. If you have any troubles, don't hesitate to ask me for help!

### Example

```
Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'webrtc', // use the webrtc connector
    room: 'Textarea-example-dev'
  },
  sourceDir: '/bower_components', // location of the y-* modules
  share: {
    textarea: 'Text' // y.share.textarea is of type Y.Text
  }
}).then(function (y) {
  // bind the textarea to a shared text element
  y.share.textarea.bind(document.getElementById('textfield'))
}
```

# Set up Signaling server
This webrtc connector is compatible to [this signaling server](https://github.com/DadaMonad/signalmaster) (signalmaster)

## License
Yjs is licensed under the [MIT License](./LICENSE).

<kevin.jahns@rwth-aachen.de>


