# attachMediaStream

## What is this?

A tiny browser module for attaching a media stream to a video element. It handles the differences between browsers.

Suitable for use with browserify/CommonJS on the client. 

If you're not using browserify or you want AMD support use `attachmediastream.bundle.js`. Note that if no module system is detected it simply attaches a function called `attachMediaStream` to `window`.


## Installing

```
npm install attachmediastream
```

## How to use it


Makes it easy to attach video streams to video tags.

```js
var getUserMedia = require('getusermedia');
var attachMediaStream = require('attachmediastream');

// get user media
getUserMedia(function (err, stream) {
    // if the browser doesn't support user media
    // or the user says "no" the error gets passed
    // as the first argument.
    if (err) {
      console.log('failed');
    } else {
      console.log('got a stream', stream);  
       
      // attaches a stream to an element (it returns the element)
      var videoEl = attachMediaStream(stream, document.getElementById('myVideo'));

      // if you don't pass an element it will create a video tag
      var generatedVideoEl = attachMediaStream(stream);

      // you can also pass options
      var videoEl = attachMediaStream(stream, someEl, {
        // this will set the autoplay attribute on the video tag
        // this is true by default but you can turn it off with this option.
        autoplay: true, 
        
        // let's you mirror the video. It's false by default, but it's common 
        // to mirror video when showing a user their own video feed.
        // This makes that easy.
        mirror: true,

        // muted is false, by default
        // this will mute the video. Again, this is a good idea when showing
        // a user their own video. Or there will be feedback issues.
        muted: true
      });

    }
});
```

## Why? 

Browsers used to to this very differently. This is now less true than it used to be. It's fairly safe to just use `URL.createObjectUrl(stream)`.

However, it's nice to know it will work if that's not true and it's also handy to be able to control mirroring, muting, autoplay in one shot with sane defaults.


## Caveats

As of writing this, FireFox doesn't let you show local video feed more than once on a page and trying to do so will result in none of them playing and it appearing broken.

As a result the `test.html` file won't work in FireFox stable unless you do one at a time.


## Other Details

The module's main function returns the element if successful and `false` otherwise. But if you're able to getUserMedia to begin with, attaching it shouldn't really fail.


## License

MIT


## Created By

If you like this, follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

