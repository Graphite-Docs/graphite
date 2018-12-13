# CompassDB

CompassDB is an open soruce ORM for [Gaia] (https://github.com/blockstack/gaia) storage.

 It provides an abstraction of a database over the file-based storage system provided by Gaia.
It’s compatible with the Blockstack ecosystem which leverages the Gaia storage, to provide database methods for developers.
## Getting Started
To get started,
> `npm install compass-db`

Or you can download the compassDB-min-js  from here.

### Example: Initialization

```javascript
// Create reliable connection with CompassDB
const compassdb = new CompassDB();

// Creating a collection
const collection = compassdb.newCollectionInstance(COLLECTION_NAME, true);
collection.createCollection()
  .then((successResponse) => {
    // Promise Resolved
  .catch((failureResponse) => {
    // Promise Rejected
  });
});

```
## Core Components

CompassDB uses abstraction concepts to render the database and create a relationship with the actual Gaia storage.

The two main components are:

* **Documents:** These are the basic structural unit of the database. Every document contains a group of key-value pairs. These are used to identify and manage request of files in the storage.
A basic constructor declaration is done with `constructor(collectionName, encrypt_decrypt).`

* **Collections** Collections are described as a set of Documents. Every Collection instance contains the name of all the Documents within that set and their status.

To setup a new connection, we must first create an instance of CompassDB followed by creating a new collection for usage(as shown in the example previously).

## Methods
### Collection Operations

* **createCollection:** Creates a new collection.
* **dropCollection:** Drops an existing collection

### Document Operations

* **insert:** inserts value within a document
* **update:** updates document with help of Id reference
* **findOne:** Finds document within collection
* **findAll:** Finds all documents with certain properties within a collection
* **deleteOne:** Deletes one document from the collection
* **deleteAll:** Deletes all documents with certain properties within a collection

### Types of Response

* **successResponse:**
Status code: 200, Status text: `SUCCESS` , Description and Payload

* **failureResponse:**
Status code: 400, Status text: `FAILURE`, Description



-----------------------
## createCollection
 `.createCollection()` creates a new collection. It fetches the list of existing collections and verifies if the requested collection exists or not.


#### Arguments:
No arguments; But to instantiate a Collection object, collectionName, encrypt_decrypt these two infomration are required.

#### Returns:
Promise.

#### Example:
```javascript
const collection = compassdb.newCollectionInstance(COLLECTION_NAME, true);
collection.createCollection()
  .then((successResponse) => {
    // Promise Resolved
  })
  .catch((failureResponse) => {
    // Promise Rejected
  });
```

## dropCollection
`.dropCollection()` implements a soft delete of the collection. It changes the `activeState` to false.

#### Arguments:
No arguments;

#### Returns:
Promise.


#### Example:
```javascript
collection.dropCollection()
  .then((successResponse) => {
    // Promise Resolved
  })
  .catch((failureResponse) => {
    // Promise Rejected
  });
```

## insert

`.insert(newDocument)` puts a document into the collection.

#### Arguments:
 `newDocument`, reference to the document that is to be pushed into the collection.

#### Returns:
Promise.

If successful then will return the inserted `Document Object` in successResponse.payload

#### Example:
```javascript
collection.insert(newDocument)
  .then((successResponse) => {
    // Promise Resolved
  })
  .catch((failureResponse) => {
    // Promise Rejected
  });
```

## update

`.update(id,queries)` is used for updating documents already inserted in a collection.

#### Arguments:
`id` and `query`.
The id is used to find the particular document in the collection and after that, the requested queries are processed if eligible.

#### Returns:
Promise.

If successful then will return the updated `Document Object` in successResponse.payload

#### Example:
```javascript
const id = 1;
collection.update(id, { 'title' : 'CompassDB', 'note' : 'Most promising ORM' })
  .then((successResponse) => {
    // Promise Resolved
  })
  .catch((failureResponse) => {
    // Promise Rejected
  });
```

## findOne

`.findOne(queries)` fetches the first document in the collection that contains the given queries.

#### Arguments:
 `query`.
The search result brings the first document that matches the description of the key-value pair of the queries. If not found, it gives a `failureResponse` in return.

#### Returns:
 Promise

 If successful then will return the `Document Object` in successResponse.payload

#### Example:
```javascript
collection.findOne({ 'title' : 'CompassDB', 'note' : 'Most promising ORM' })
  .then((successResponse) => {
    // Promise Resolved
  })
  .catch((failureResponse) => {
    // Promise Rejected
  });
```

## findAll

`.findAll(queries)` fetches all the documents in the collection that contains the given queries as an array of object.

#### Arguments:
 `query`.
The search result brings all documents that match the description of the key-value pair of the queries. If not a single document found, it gives a `failureResponse` in return.

#### Returns:
 Promise

 If successful then will return an array of `Document Objects` in successResponse.payload

#### Example:
```javascript
collection.findAll({ 'title' : 'CompassDB', 'note' : 'Most promising ORM' })
  .then((successResponse) => {
    // Promise Resolved
  })
  .catch((failureResponse) => {
    // Promise Rejected
  });
```

## deleteOne

`.deleteOne(query)` removes the first document that is found matching the query. Here, the `isActive` state of the document is changed to false.

#### Arguments:
`query`
deletes the first document that matches the description of the key-value pair of the queries. If not found, it gives a `failureResponse` in return.

#### Returns:
 Promise.

  If successful then will return the deleted `Document Object` in successResponse.payload

#### Example:

```javascript
collection.deleteOne({ 'title' : 'another', 'note' : 'test' })
  .then((successResponse) => {
    // Promise Resolved
  })
  .catch((failureResponse) => {
    // Promise Rejected
  });
```

## deleteAll

`.deleteAll(query)` removes the all the documents that match the query. Here, the `isActive` state of the documents are changed to false.

#### Arguments:
`query`
deletes all documents that match the description of the key-value pair of the queries. If not found, it gives a `failureResponse` in return.

#### Returns:
 Promise.

  If successful then will return an array of deleted `Document Objects` in successResponse.payload

#### Example:

```javascript
collection.deleteAll({ 'title' : 'check', 'note' : 'check' })
  .then((successResponse) => {
    // Promise Resolved
  })
  .catch((failureResponse) => {
    // Promise Rejected
  });
```
