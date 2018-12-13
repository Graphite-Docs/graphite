# SDP-Jingle-JSON
**Convert SDP blobs to and from JSON**

[![Build Status](https://travis-ci.org/otalk/sdp-jingle-json.png)](https://travis-ci.org/otalk/sdp-jingle-json)
[![Dependency Status](https://david-dm.org/otalk/sdp-jingle-json.png)](https://david-dm.org/otalk/sdp-jingle-json)
[![devDependency Status](https://david-dm.org/otalk/sdp-jingle-json/dev-status.png)](https://david-dm.org/otalk/sdp-jingle-json#info=devDependencies)

[![Browser Support](https://ci.testling.com/otalk/sdp-jingle-json.png)](https://ci.testling.com/otalk/sdp-jingle-json)


## What is this?

Ever taken a peek at the data blobs that get sent back and forth in WebRTC
signalling? Yeah, that mess of line-oriented data is SDP. But sometimes
you want to have that data available in JSON, like if you want to use XMPP
Jingle for signalling.

This library will convert raw SDP into JSON that mirrors the structure of
XMPP Jingle content, making it simple to convert the SDP data into an XMPP 
stanza with any of the various JS XMPP libraries, such as [stanza.io](https://github.com/otalk/stanza.io),
or [xmpp-ftw](https://github.com/lloydwatkin/xmpp-ftw).

And since you're working with WebRTC, be sure to check out
[simplewebrtc](http://simplewebrtc.com).


## Installing

```
npm install sdp-jingle-json
```

## Building bundled/minified version (for AMD, etc)

```sh
$ grunt
```

The bundled and minified files will be in the generated `build` directory.

## How to use it

```
var sjj = require('sdp-jingle-json');

// I have SDP, but want JSON:
var json = sjj.toSessionJSON(sdpBlob, {
    creators: ['initiator', 'initiator'], // Who created the media contents
    role: 'inititator',   // Which side of the offer/answer are we acting as
    direction: 'outgoing' // Are we parsing SDP that we are sending or receiving?
});

// I have JSON (a dictionary of session and content descriptions), but want SDP:
var sdp = sjj.toSessionSDP(jsonSession, {
    role: 'responder',
    direction: 'incoming'
});
```

You can also use `toMediaSDP` and `toMediaJSON` to convert only a single media section.

## See it in action

Open the `convert.html` file and enter in SDP or JSON to see how it converts back and forth.

## Jingle JSON

The format for the generated JSON content is:

```
{
    "action": "",
    "initiator": "",
    "responder": "",
    "sid": "",
    // ---- Content payload
    "groups": [
        {
            "semantics": "",
            "contents": [],
        } //...
    ],
    "contents": [
        {
           "name": "",
           "creator": "",
           "senders": "",
           "description": {
               // ---- RTP description
               "descType": "rtp",
               "media": "",
               "ssrc": "",
               "sourceGroups": [
                    {
                        "semantics": "",
                        "sources": [
                            "" //...
                        ]
                    } //...
               ],
               "sources": [
                   {
                       "ssrc": "",
                       "parameters: [
                           {
                               "key": "",
                               "value": ""
                           } //...
                       ]
                   } //...
               ],
               "bandwidth": "",
               "bandwidthType": "",
               "headerExtensions": [
                   {
                       "id": "",
                       "uri": "",
                       "senders": ""
                   } //...
               ],
               "payloads": [
                   {
                       "id": "",
                       "channels": "",
                       "clockrate": "",
                       "maxptime": "",
                       "ptime": "",
                       "name": "",
                       "parameters": [
                           {
                               "key": "",
                               "value": ""
                           } //...
                       ],
                       "feedback": [
                           {
                               "type": "",
                               "subtype": "",
                               "value": ""
                           } //...
                       ]
                   }
                ],
                "encryption": [
                    {
                        "cipherSuite": "",
                        "keyParams": "",
                        "sessionParams": "",
                        "tag": ""
                    } //...
                ]
           },
           "transport": {
               // ---- ICE UDP transport
               "transType": "iceUdp",
               "ufrag": "",
               "pwd": "",
               "setup": "",
               "candidates": [
                   {
                       "component": "",
                       "foundation": "",
                       "generation": "",
                       "id": "",
                       "ip": "",
                       "network": "",
                       "port": "",
                       "priority": "",
                       "protocol": "",
                       "relAddr": "",
                       "relPort": "",
                       "type": ""
                   } //...
               ],
               "fingerprints": [
                   {
                   "hash": "",
                   "value": ""
                   } // ...
               ]
           }
        } //...
    ]
}
```

## License

MIT

## Created By

If you like this, follow [@lancestout](http://twitter.com/lancestout) or [@HCornflower](http://twitter.com/HCornflower) on twitter.

SDP-Jingle-JSON is derived, in collaboration, from the work done by Philipp Hancke for [strophe.jingle](https://github.com/estos/strophe.jingle).
