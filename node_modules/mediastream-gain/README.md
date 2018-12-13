# mediastream-gain 

## What is this?

A tiny browser module for creating a gain/volume controller for the audio channels in a [MediaStream](https://developer.mozilla.org/en-US/docs/WebRTC/MediaStream_API).

It's useful for controlling the volume of your microphone input before it's sent accross a peer connection in a WebRTC call, for example. This module is a small part of [SimpleWebRTC](http://simplewebrtc.com) where it is used for minimizing echos, by using [hark](http://latentflip.com/hark) to determine if you're speaking and turning your mic down a bit if you're not.

This module is suitable for use with [browserify](http://browserify.org)/CommonJS on the client. 

If you're not using browserify or you want AMD support use `mediastream-volume.bundle.js`.


## Important details

The way this works by replacing the first audio channel in the stream with one that is run through a gain filter. But beware that this *edits the stream you give it in place* it doesn't produce a new one.


## Installing

```
npm install mediastream-gain
```

## An example

Here we use another piece of SimpleWebRTC [getusermedia](https://github.com/HenrikJoreteg/getusermedia) to fetch user media in a cross-browser, easy-to-handle-errors-and-lack-of-support sort of way. 

This assumes a commonJS environment, but that's not a requirement (see above).

```js
var MicGainController = require('mediastream-gain');
var getUserMedia = require('getusermedia');
var gainController;

getUserMedia(function (err, stream) {
    // this will replace the audio channels in the 
    // stream
    gainController = new MicGainController(stream);
    // set gain to 20%
    gainControl.setGain(.2);
    // set gain to 0, effectively muting it
    gainControl.setGain(0); 
    // there's also:
    gainControl.off(); // equivalent to setGain(0)
    gainControl.on(); // equivalent to setGain(1)
});

```

## Methods

It couldn't be simpler, but behavior varies slighly based on availability of WebAudio support that can be wired into WebRTC.

You can check for support by checking the `support` property of the an instance of `gainController`

These will simply be noop functions if WebAudio isn't fully supported. 

**.setGain(Float)** - takes a number between 1 and 0
**.getGain()** - returns current setting
**.off()** - shortcut for turning mic off 
**.on()** - shortcut for full gain


## License

MIT

## Created By

If you like this, follow: [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

