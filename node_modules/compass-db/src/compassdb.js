import Document from './document';

class CompassDB {

  constructor() {
    this.init();
  }

  init() {
    //add connection logic - if required
    console.log('Setting up connection');
  }

  newCollectionInstance(collectionName, encrypt_decrypt) {
    return new Document(collectionName, encrypt_decrypt);
  }

}

export default CompassDB;
