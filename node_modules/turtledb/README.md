<p align="center"><img width=80% src="https://turtle-db.github.io/images/logo_full.png"></p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#features">Features</a> •
  <a href="#contributors">Contributors</a> •
  <a href="#license">License</a> •
</p>

# Overview

turtleDB is a JavaScript framework for developers to build offline-first, collaborative web applications. It provides a developer-friendly API to access an in-browser database built on top of IndexedDB.

It comes with built in document versioning and automatic server synchronization when paired with our back-end package [tortoiseDB](https://github.com/turtle-DB/tortoiseDB), as well as developer-controlled, flexible conflict resolution strategies for any document conflicts while collaborating.

You can check out our [API documentation](https://turtle-db.github.io/api) and read more about the story behind project itself [here](https://turtle-db.github.io/about).

Note: for the best user experience we strongly recommend using Chrome.

<br>
<p align="center"><img width=80% src="/api-example.gif" /></p>
<br>

# Getting Started

## Install

```javascript
npm i turtledb
```

## Usage

```javascript
import TurtleDB from 'turtledb';
// or
const TurtleDB = require('turtledb');
```

```javascript
// Create a new database
const mydb = new TurtleDB('example');

// Link a remote tortoiseDB database to sync to
mydb.setRemote('http://127.0.0.1:3000');

// CRUD Operations - all return promises
mydb.create({ _id: 'firstTurtle', species: 'Sea Turtle' });
mydb.read('firstTurtle').then((doc) => console.log(doc));
mydb.update('firstTurtle', { species: 'Giant Turtle' });
mydb.mergeUpdate('firstTurtle', { name: 'Michelangelo' });
mydb.delete('firstTurtle');

// Sync
mydb.sync();
```

[Full API Documentation](https://turtle-db.github.io/api)

# Features

- Simple Promise-based API
- Integration with IndexedDB
- Document versioning and developer-controlled conflict resolution
- Synchronization with tortoiseDB and a MongoDB back-end
- Batching during synchronization
- Local database compaction

# Contributors

<img width=150px src="https://turtle-db.github.io/images/andrew.png">
<p><strong>Andrew Houston-Floyd - NYC</strong> - <a href="https://turtle-db.github.io">Website</a></p>
<img width=150px src="https://turtle-db.github.io/images/max.png">
<p><strong>Max Appleton - SF/Bay Area</strong> - <a href="https://maxiappleton.github.io/">Website</a></p>
<img width=150px src="https://turtle-db.github.io/images/steven.png">
<p><strong>Steven Shen - Toronto</strong> - <a href="https://rockdinosaur.github.io/">Website</a></p>

# License

This project is licensed under the MIT License.
