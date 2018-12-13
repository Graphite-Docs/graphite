[![view on npm](http://img.shields.io/npm/v/fnv1a.svg?style=flat-square)](https://www.npmjs.com/package/fnv1a)
[![npm module downloads per month](http://img.shields.io/npm/dm/fnv1a.svg?style=flat-square)](https://www.npmjs.com/package/fnv1a)
![Analytics](https://ga-beacon.appspot.com/UA-66872036-1/fnv1a/Readme.md?pixel)

# fnv1a

Simple and fast 32 bit FNV-1a hash for [node.js](http://nodejs.org) based on [this](http://isthe.com/chongo/tech/comp/fnv/).

## Usage

```js

var assert = require('assert'), 
    hash   = require('fnv1a'),
    value  = hash('node.js')

// decimal

assert.equal(value, 3096844302)

// hexadecimal

assert.equal(value.toString(16), 'b896180e')

// string

assert.equal(value.toString(36), '1f7s4cu')

```

## Installation

With npm:

    npm install --save fnv1a
    
With git:
    
    git clone git://github.com/schwarzkopfb/fnv1a.git

## License

[MIT license](https://github.com/schwarzkopfb/fnv1a/blob/master/LICENSE).
