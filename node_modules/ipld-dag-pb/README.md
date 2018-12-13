# js-ipld-dag-pb

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPLD-blue.svg?style=flat-square)](http://github.com/ipld/ipld)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/ipld/js-ipld-dag-pb/badge.svg?branch=master)](https://coveralls.io/github/ipld/js-ipld-dag-pb?branch=master)
[![Dependency Status](https://david-dm.org/ipld/js-ipld-dag-pb.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-pb)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Greenkeeper badge](https://badges.greenkeeper.io/ipld/js-ipld-dag-pb.svg)](https://greenkeeper.io/)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> JavaScript Implementation of the IPLD Format MerkleDAG Node in Protobuf. In addition to the IPLD Format methods, this module also provides an API for creating the nodes and manipulating them (adding and removing links, etc).

## Lead Maintainer

[Volker Mische](https://github.com/vmx)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Examples](#examples)
    - [Create a DAGNode](#create-a-dagnode)
    - [Add and remove a Link](#add-and-remove-a-link)
- [API](#api)
  - [DAGNode functions](#dagnode-functions)
    - [DAGNode.create(data, links, hashAlg, callback)](#dagnodecreatedata-links-hashalg-callback)
    - [addLink(node, link, callback)](#addlinknode-link-callback)
    - [rmLink(node, nameOrMultihash, callback)](#rmlinknode-nameormultihash-callback)
    - [clone(node, callback)](#clonenode-callback)
  - [DAGNode instance methods and properties](#dagnode-instance-methods-and-properties)
    - [`node.data`](#nodedata)
    - [`node.links`](#nodelinks)
    - [`node.size`](#nodesize)
    - [`node.multihash`](#nodemultihash)
    - [`node.serialized`](#nodeserialized)
    - [`node.toJSON()`](#nodetojson)
    - [`node.toString()`](#nodetostring)
  - [DAGLink functions](#daglink-functions)
    - [DAGLink.create(name, size, multihash, callback)](#daglinkcreatename-size-multihash-callback)
  - [DAGLink instance methods and properties](#daglink-instance-methods-and-properties)
    - [`link.name`](#linkname)
    - [`link.size`](#linksize)
    - [`link.multihash`](#linkmultihash)
    - [`link.toJSON()`](#linktojson)
    - [`link.toString()`](#linktostring)
  - [[IPLD Format Specifics](https://github.com/ipld/interface-ipld-format) - Local (node/block scope) resolver](#ipld-format-specificshttpsgithubcomipldinterface-ipld-format---local-nodeblock-scope-resolver)
    - [`dagPB.resolver.resolve`](#dagpbresolverresolve)
    - [`dagPB.resolver.tree`](#dagpbresolvertree)
    - [`dagPB.resolver.patch`](#dagpbresolverpatch)
  - [[IPLD Format Specifics](https://github.com/ipld/interface-ipld-format) - util](#ipld-format-specificshttpsgithubcomipldinterface-ipld-format---util)
  - [`dagPB.util.cid`](#dagpbutilcid)
  - [`dagPB.util.serialize`](#dagpbutilserialize)
  - [`dagPB.util.deserialize`](#dagpbutildeserialize)
- [Contribute](#contribute)
- [License](#license)

## Install

```bash
> npm install ipld-dag-pb --save
```

## Usage

```JavaScript
const dagPB = require('ipld-dag-pb')

dagPB.DAGNode.create  // create a DAGNode
dagPB.DAGNode.clone   // clone a DAGNode
dagPB.DAGNode.addLink // add a Link to a DAGNode, creating a new one
dagPB.DAGNode.rmLink  // remove a Link to a DAGNode, creating a new one
dagPB.DAGLink.create  // create a DAGLink

// IPLD Format specifics
dagPB.resolver
dagPB.util
```

### Examples

#### Create a DAGNode

```JavaScript
DAGNode.create(new Buffer('some data'), (err, node1) => {
  if (err) {
    throw error
  }
  // node1 is your DAGNode instance.
})

DAGNode.create('some data', (err, node2) => {
  // node2 will have the same data as node1.
})
```

#### Add and remove a Link

```JavaScript
const link = {
  name: 'I am a link',
  multihash: 'QmHash..',
  size: 42
}

DAGNode.addLink(node, link, (err, nodeA) => {
  if (err) {
    throw err
  }
  // node - DAGNode instance with the link
  console.log('with link', nodeA.toJSON())

  DAGNode.rmLink(nodeA, 'I am a link', (err, nodeB) => {
    if (err) {
      throw err
    }

  // node - DAGNode instance without the link, equal to just node
  console.log('without link', nodeB.toJSON())
  })
})
```

## API

### DAGNode functions

DAGNodes are immutable objects, in order to manipulate them you have to follow a function approach of applying function and getting new instances of the given DAGNode.

You can incude it in your project with:

```JavaScript
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
```

#### DAGNode.create(data, links, hashAlg, callback)

- `data` - type: Buffer
- `links`- type: Array of DAGLink instances or Array of DAGLink instances in its json format (link.toJSON)
- `hashAlg` - type: String
- `callback` - type: function with signature `function (err, node) {}`

Create a DAGNode.

```JavaScript
DAGNode.create('data', links, (err, dagNode) => {
  // ...
})
```

links can be a single or an array of DAGLinks instances or objects with the following pattern

```JavaScript
{
  name: '<some name>',
  hash: '<some multihash>', // can also be `multihash: <some multihash>`
  size: <sizeInBytes>
}
```

#### addLink(node, link, callback)

- `node` - type: DAGNode
- `link` - type: DAGLink or DAGLink in its json format
- `callback` - type: function with signature `function (err, node) {}`

Creates a link on node A to node B by using node B to get its multihash. Returns a *new* instance of DAGNode without modifying the old one.

Creates a new DAGNode instance with the union of node.links plus the new link.

`link` can be:
- DAGLink instance
- DAGNode instance
- Object with the following properties:

```JavaScript
{
  name: '<some string>', // optional
  size: <size in bytes>,
  multihash: <multihash> // can be a String multihash or multihash buffer
}
```


#### rmLink(node, nameOrMultihash, callback)

- `node` - type: DAGNode
- `nameOrMultihash` - type: String or multihash buffer
- `callback` - type: function with signature `function (err, node) {}`

Removes a link from the node by name. Returns a *new* instance of DAGNode without modifying the old one.

```JavaScript
DAGNode.rmLink(node, 'Link1' (err, dagNode) => ...) 
```

#### clone(node, callback)

- `node` - type: DAGNode
- `callback` - type: function with signature `function (err, node) {}`

Creates a clone of the DAGNode instance passed

```JavaScript
DAGNode.clone(node, (err, nodeClone) => {})
```

### DAGNode instance methods and properties

You have the following methods and properties available in every DAGNode instance.

#### `node.data`

#### `node.links`

An array of `DAGLinks`

#### `node.size`

Size of the node, in bytes

#### `node.multihash`

#### `node.serialized`

#### `node.toJSON()`

#### `node.toString()`


### DAGLink functions

Following the same pattern as [`DAGNode functions`]() above, DAGLink also offers a function for its creation. 

You can incude it in your project with:

```JavaScript
const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
```

#### DAGLink.create(name, size, multihash, callback)

```JavaScript
DAGLink.create(
  'link-to-file',  // name of the link (can be empty)
  10,              // size in bytes
  'QmSomeHash...', // can be multihash buffer or string
  (err, link) => {
    if (err) {
      throw err
    }
   // link is a DAGLink instance
})
```

Note: DAGLinks are simpler objects and can be instantiated directly:

```JavaScript
const link = new DAGLink(name, size, multihash)
```

### DAGLink instance methods and properties

#### `link.name`

#### `link.size`

#### `link.multihash`

#### `link.toJSON()`

#### `link.toString()`

### [IPLD Format Specifics](https://github.com/ipld/interface-ipld-format) - Local (node/block scope) resolver

> See: https://github.com/ipld/interface-ipld-format#local-resolver-methods


#### `dagPB.resolver.resolve`

#### `dagPB.resolver.tree`

#### `dagPB.resolver.patch`

### [IPLD Format Specifics](https://github.com/ipld/interface-ipld-format) - util

> See: https://github.com/ipld/interface-ipld-format#ipld-format-utils

### `dagPB.util.cid`

### `dagPB.util.serialize`

### `dagPB.util.deserialize`

## Contribute

Please contribute! [Look at the issues](https://github.com/ipld/js-ipld-dag-pb/issues)!

Check out our [contributing document](https://github.com/ipld/ipld/blob/master/contributing.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to IPLD are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[ISC](LICENSE) © 2016 Protocol Labs Inc.
