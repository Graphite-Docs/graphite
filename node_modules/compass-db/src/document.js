import Collection from './collection';
import { successResponse, failureResponse } from './response';
import {
  DOCUMENT_ADDED,
  ERROR_IN_ADDING_DOCUMENT,
  COLLECTION_NOT_ACTIVE,
  COLLECTION_DOESNT_EXIST,
  DOCUMENT_FOUND,
  DOCUMENT_NOT_FOUND,
  ERROR_IN_FINDING_DOCUMENT,
  DOCUMENT_DELETED,
  ERROR_IN_DELETING_DOCUMENT,
  DOCUMENT_UPDATED,
  ERROR_IN_UPDATING_DOCUMENT
} from './constants';

class Document extends Collection {

  constructor(collectionName, encrypt_decrypt) {
    super(collectionName, encrypt_decrypt);
  }

  insert(newDocument) {
    return new Promise((resolve, reject) => {
      // if collection exists and is active
      if(this.collectionExists && this.collectionIsActive) {
        blockstack.getFile(this.collectionName, this.encrypt_decrypt)
          .then((fileText) => {
            let items = JSON.parse(fileText);

            newDocument.id = items.length;
            newDocument.createdAt = Date.now();
            newDocument.isActive = true;

            items.push(newDocument);

            blockstack.putFile(this.collectionName, JSON.stringify(items), this.encrypt_decrypt)
              .then(() => {
                successResponse.description = DOCUMENT_ADDED;
                successResponse.payload = newDocument;
                resolve(successResponse);
              })
              .catch(() => {
                failureResponse.description = ERROR_IN_ADDING_DOCUMENT;
                reject(failureResponse);
              });
          })
          .catch(() => {
            // collection is not a file yet
            let items = [];
            newDocument.id = items.length;
            newDocument.createdAt = Date.now();
            newDocument.isActive = true;

            items.push(newDocument);

            blockstack.putFile(this.collectionName, JSON.stringify(items), this.encrypt_decrypt)
              .then(() => {;
                successResponse.description = DOCUMENT_ADDED;
                successResponse.payload = newDocument;
                resolve(successResponse);
              })
              .catch(() => {
                failureResponse.description = ERROR_IN_ADDING_DOCUMENT;
                reject(failureResponse);
              });
          });
      } else {
        if (!this.collectionIsActive){
          failureResponse.description = COLLECTION_NOT_ACTIVE;
        } else {
          failureResponse.description = COLLECTION_DOESNT_EXIST;
        }
        reject(failureResponse);
      }
    });
  }

  findOne(query) {
    const keys = Object.getOwnPropertyNames(query);

    return new Promise((resolve, reject) => {
      // if collection exists and is active
      if(this.collectionExists && this.collectionIsActive) {
        blockstack.getFile(this.collectionName, this.encrypt_decrypt)
          .then((fileText) => {
            const content = JSON.parse(fileText);

            let checkSearchParameters = [];
            let addToList = true;
            let index = 0;

            for(let i = 0; i < keys.length; i++){
              checkSearchParameters[i] = false;
            }

            content.forEach((item) => {
              index = 0;
              addToList = true;

              keys.forEach((key) => {
                if (item.hasOwnProperty(key)) {
                  if((item[key] === query[key]) && item.isActive) {
                    checkSearchParameters[index] = true;
                  }
                }
                index++;
              });

              checkSearchParameters.forEach((value) => {
                if (!value) {
                  addToList = false;
                }
              });

              if (addToList) {
                successResponse.description = DOCUMENT_FOUND;
                successResponse.payload = item;
                resolve(successResponse);
              }

              for(let i = 0; i < keys.length; i++){
                checkSearchParameters[i] = false;
              }
            });
            failureResponse.description = DOCUMENT_NOT_FOUND;
            reject(failureResponse);
          })
          .catch(() => {
            failureResponse.description = ERROR_IN_FINDING_DOCUMENT;
            reject(failureResponse);
          });
      } else {
        if (!this.collectionIsActive){
          failureResponse.description = COLLECTION_NOT_ACTIVE;
        } else {
          failureResponse.description = COLLECTION_DOESNT_EXIST;
        }
        reject(failureResponse);
      }
    });
  }

  findAll(query) {
    const keys = Object.getOwnPropertyNames(query);

    return new Promise((resolve, reject) => {
      // if collection exists and is active
      if(this.collectionExists && this.collectionIsActive) {
        blockstack.getFile(this.collectionName, this.encrypt_decrypt)
          .then((fileText) => {
            const content = JSON.parse(fileText);

            let found = false;
            let items = [];
            let checkSearchParameters = [];
            let addToList = true;
            let index = 0;

            for(let i = 0; i < keys.length; i++){
              checkSearchParameters[i] = false;
            }

            content.forEach((item) => {
              index = 0;
              addToList = true;

              keys.forEach((key) => {
                if (item.hasOwnProperty(key)) {
                  if((item[key] === query[key]) && item.isActive) {
                    checkSearchParameters[index] = true;
                  }
                }
                index++;
              });

              checkSearchParameters.forEach((value) => {
                if (!value) {
                  addToList = false;
                }
              });

              if (addToList) {
                items.push(item);
                found = true;
              }

              for(let i = 0; i < keys.length; i++){
                checkSearchParameters[i] = false;
              }
            });

            if (found) {
              successResponse.description = DOCUMENT_FOUND;
              successResponse.payload = items;
              resolve(successResponse);
            } else {
              failureResponse.description = DOCUMENT_NOT_FOUND;
              reject(failureResponse);
            }
          })
          .catch(() => {
            failureResponse.description = ERROR_IN_FINDING_DOCUMENT;
            reject(failureResponse);
          });
      } else {
        if (!this.collectionIsActive){
          failureResponse.description = COLLECTION_NOT_ACTIVE;
        } else {
          failureResponse.description = COLLECTION_DOESNT_EXIST;
        }
        reject(failureResponse);
      }
    });
  }

  deleteOne(query) {
    const keys = Object.getOwnPropertyNames(query);

    return new Promise((resolve, reject) => {
      // if collection exists and is active
      if(this.collectionExists && this.collectionIsActive) {
        blockstack.getFile(this.collectionName, this.encrypt_decrypt)
          .then((fileText) => {
            const content = JSON.parse(fileText);

            let items = [];
            let deleted = false;
            let deletedItem;
            let checkSearchParameters = [];
            let addToList = true;
            let index = 0;

            for(let i = 0; i < keys.length; i++){
              checkSearchParameters[i] = false;
            }

            content.forEach((item) => {
              index = 0;
              addToList = true;

              keys.forEach((key) => {
                if (item.hasOwnProperty(key)) {
                  if((item[key] === query[key]) && item.isActive) {
                    checkSearchParameters[index] = true;
                  }
                }
                index++;
              });

              checkSearchParameters.forEach((value) => {
                if (!value) {
                  addToList = false;
                }
              });

              if (addToList && !deleted) {
                item.isActive = false;
                deletedItem = item;
                deleted = true;
              }

              items.push(item);

              for(let i = 0; i < keys.length; i++){
                checkSearchParameters[i] = false;
              }
            });

            if(deleted) {
              blockstack.putFile(this.collectionName, JSON.stringify(items), this.encrypt_decrypt)
                .then(() => {
                  successResponse.description = DOCUMENT_DELETED;
                  successResponse.payload = deletedItem;
                  resolve(successResponse);
                })
                .catch(() => {
                  failureResponse.description = ERROR_IN_DELETING_DOCUMENT;
                  reject(failureResponse);
                });
            } else {
              failureResponse.description = DOCUMENT_NOT_FOUND;
              reject(failureResponse);
            }
          })
          .catch(() => {
            failureResponse.description = ERROR_IN_DELETING_DOCUMENT;
            reject(failureResponse);
          });
      } else {
        if (!this.collectionIsActive){
          failureResponse.description = COLLECTION_NOT_ACTIVE;
        } else {
          failureResponse.description = COLLECTION_DOESNT_EXIST;
        }
        reject(failureResponse);
      }
    });
  }

  deleteAll(query) {
    const keys = Object.getOwnPropertyNames(query);

    return new Promise((resolve, reject) => {
      // if collection exists and is active
      if(this.collectionExists && this.collectionIsActive) {
        blockstack.getFile(this.collectionName, this.encrypt_decrypt)
          .then((fileText) => {
            const content = JSON.parse(fileText);

            let items = [];
            let deleted = false;
            let deletedItems = [];

            let checkSearchParameters = [];
            let addToList = true;
            let index = 0;

            for(let i = 0; i < keys.length; i++){
              checkSearchParameters[i] = false;
            }

            content.forEach((item) => {
              index = 0;
              addToList = true;

              keys.forEach((key) => {
                if (item.hasOwnProperty(key)) {
                  if((item[key] === query[key]) && item.isActive) {
                    checkSearchParameters[index] = true;
                  }
                }
                index++;
              });

              checkSearchParameters.forEach((value) => {
                if (!value) {
                  addToList = false;
                }
              });

              if (addToList) {
                item.isActive = false;
                deletedItems.push(item);
                deleted = true;
              }

              items.push(item);

              for(let i = 0; i < keys.length; i++){
                checkSearchParameters[i] = false;
              }
            });

            if(deleted) {
              blockstack.putFile(this.collectionName, JSON.stringify(items), this.encrypt_decrypt)
                .then(() => {
                  successResponse.description = DOCUMENT_DELETED;
                  successResponse.payload = deletedItems;
                  resolve(resolvedItem);
                })
                .catch(() => {
                  failureResponse.description = ERROR_IN_DELETING_DOCUMENT;
                  reject(failureResponse);
                });
            } else {
              failureResponse.description = DOCUMENT_NOT_FOUND;
              reject(failureResponse);
            }
          })
          .catch(() => {
            failureResponse.description = ERROR_IN_DELETING_DOCUMENT;
            reject(failureResponse);
          });
      } else {
        if (!this.collectionIsActive){
          failureResponse.description = COLLECTION_NOT_ACTIVE;
        } else {
          failureResponse.description = COLLECTION_DOESNT_EXIST;
        }
        reject(failureResponse);
      }
    });
  }

  update(id, query) {
    const keys = Object.getOwnPropertyNames(query);

    return new Promise((resolve, reject) => {
      // if collection exists and is active
      if(this.collectionExists && this.collectionIsActive) {
        blockstack.getFile(this.collectionName, this.encrypt_decrypt)
          .then((fileText) => {
            const content = JSON.parse(fileText);

            let items = [];
            let updated = false;
            let updatedItem;

            content.forEach((item) => {
              if ((item.id === id) && item.isActive) {

                // logic to update the document
                keys.forEach((key) => {
                  if (item.hasOwnProperty(key)) {
                    item[key] = query[key];
                  }
                });

                updated = true;
                updatedItem = item;
              }
              items.push(item);
            });

            if (updated) {
              blockstack.putFile(this.collectionName, JSON.stringify(items), this.encrypt_decrypt)
                .then(() => {
                  successResponse.description = DOCUMENT_UPDATED;
                  successResponse.payload = updatedItem;
                  resolve(successResponse);
                })
                .catch(() => {
                  failureResponse.description = ERROR_IN_UPDATING_DOCUMENT;
                  reject(failureResponse);
                });
            } else {
              failureResponse.description = DOCUMENT_NOT_FOUND;
              reject(failureResponse);
            }

          })
          .catch(() => {
            failureResponse.description = ERROR_IN_UPDATING_DOCUMENT;
            reject(failureResponse);
          });
      } else {
        if (!this.collectionIsActive){
          failureResponse.description = COLLECTION_NOT_ACTIVE;
        } else {
          failureResponse.description = COLLECTION_DOESNT_EXIST;
        }
        reject(failureResponse);
      }
    });
  }

}

export default Document;
