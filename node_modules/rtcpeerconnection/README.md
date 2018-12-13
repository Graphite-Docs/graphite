# RTCPeerConnection


## What is this?

A tiny browser module that normalizes and simplifies the API for WebRTC peer connections.

It gives us a cleaner (cross-browser) way to handle offer/answer and is based on an event emitter.

If you're not using browserify or you want AMD support use `rtcpeerconnection.bundle.js`.

## Installing

```
npm install rtcpeerconnection
```

## How to use it


### Instantiation

Instantiation takes the same options as a normal peer connection constructor:

```js
var PeerConnection = require('rtcpeerconnection');


// init it like a normal peer connection object
// passing in ice servers/constraints the initial server config
// also takes a couple other options:
// debug: true (to log out all emitted events)
var pc = new PeerConnection({config servers as usual}, {constraints as to regular PC});
```


### Events


Unlike stock Peer Connections this inherits from a generic event emitter. Powered by [WildEmitter](http://github.com/henrikjoreteg/wildemitter) which has a very familiar API if you're used to node.js/jQuery/Backbone but also includes a wildcard handler so you can easily debug events. Just do `emitter.on('*')` to log them out or whatnot.

But instead of doing `pc.onicecandidate = function () {}` on a peer connection you listen for events like this:


```js

// ice candidates
pc.on('ice', function (candidate) {
    // it's your job to send these to someone
    connection.send('ice', candidate);
});

// you can listen for end of candidates (not particularly useful)
pc.on('endOfCandidates', function () {
    // no more ice candidates
});

// remote stream added
pc.on('addStream', function (event) {
    // do something with event.stream
    // probably attach it to a <video> element
    // and play it.
});

// remote stream removed
pc.on('removeStream', function (event) {
    // remote stream removed
    // now you could hide/disable removed video
});

// you can chose to listen for events for 
// offers and answers instead, if you prefer 
pc.on('answer', function (err, answer) { ... });
pc.on('offer', function (err, offer) { ... });

// on peer connection close
pc.on('close', function () { ... });
```


### Methods

Note that all callbacks follow the "error first" convention. Meaning, rather than pass a success and fail callback, you pass a single callback.

If there is an error, the first argument passed to the callback will be a truthy value (the error itself).

The whole offer/answer cycle looks like this:

```js
// assumptions
var pc = new PeerConnection(config, constraints);
var connection = new RealTimeConnection(); // could be socket.io or whatever


// create an offer
pc.offer(function (err, offer) {
    if (!err) connection.send('offer', offer)
});

// you can also optionally pass in constraints
// when creating an offer.
pc.offer({
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: false
        }
    }, 
    function (err, offer) {
        if (!err) connection.send('offer', offer);
    }
);

// when you recieve an offer, you can answer
// with various options
connection.on('offer', function (offer) {
    // let the peerconnection handle the offer
    // by calling handleOffer
    pc.handleOffer(offer, function (err) {
        if (err) {
            // handle error
            return;
        }

        // you can just call answer
        pc.answer(function (err, answer) {
            if (!err) connection.send('answer', answer);
        });

        // you can call answer with contstraints
        pc.answer(MY_CONSTRAINTS, function (err, answer) {
            if (!err) connection.send('answer', answer);
        });    

        // or you can use one of the shortcuts answers

        // for video only
        pc.answerVideoOnly(function (err, answer) { ... });

        // and audio only
        pc.answerAudioOnly(function (err, answer) { ... });
    }); 
});

// when you get an answer, you just call
// handleAnswer
connection.on('answer', function (answer) {
    pc.handleAnswer(answer);
});

// the only other thing you have to do is listen, transmit, and process ice candidates

// you have to send them when generated
pc.on('ice', function (candidate) {
    connection.send('ice', candidate);
});

// process incoming ones
connection.on('ice', function (candidate) {
    pc.processIce(candidate);
});
```


That's it!


## More

If you want higher level functionality look at [SimpleWebRTC](http://simplewebrtc.com) that uses this library.


## License

MIT

## Credits

If you like this, follow: [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

