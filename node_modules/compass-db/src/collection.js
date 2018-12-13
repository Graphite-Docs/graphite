import { successResponse, failureResponse } from './response';
import {
  COLLECTION_ALREADY_EXISTS,
  SOFT_DELETED_THE_COLLECTION,
  SOME_PROBLEM_OCCURED,
  ERROR_IN_DROPING_COLLECTION,
  ALREADY_INACTIVE_COLLECTION,
  COLLECTION_DOESNT_EXIST,
  LIST_UPDATED,
  ERROR_LIST_NOT_UPDATED,
  COLLECTION_MASTER
} from './constants';

class Collection {

  constructor(collectionName, encrypt_decrypt) {
    this.collectionName = collectionName;
    this.encrypt_decrypt = encrypt_decrypt;
    this.collectionExists = false;
    this.collectionIsActive = false;
    this.LIST_OF_ALL_COLLECTIONS = COLLECTION_MASTER;
  }

  createCollection() {
    return new Promise((resolve, reject) => {
      blockstack.getFile(this.LIST_OF_ALL_COLLECTIONS, this.encrypt_decrypt)
        // if the Library is not being called for the first time
        // then use list_of_all_collections.json to check whether a collection exists or not
        .then((fileText) => {
          const content = JSON.parse(fileText);
          console.log(content);
          let items = [];
          // check if list_of_all_collections.json contains collection
          content.forEach((eachCollection) => {
            // if collection is in list_of_all_collections.json then don't create a new one
            // and set the properties of the collection for this.instance
            if(eachCollection.name === this.collectionName){
              this.collectionExists = true;
              this.collectionIsActive = eachCollection.isActive;
              successResponse.description = COLLECTION_ALREADY_EXISTS;
              resolve(successResponse);
            }
            items.push(eachCollection);
          });

          // if list_of_all_collections.json doesn't have collection then create a new one
          if(!this.collectionExists){
            const item = {
              name: this.collectionName,
              isActive: true
            }
            items.push(item);
            // add this new collection in list_of_all_collections.json
            // console.log('collection doesn\'t exist but list_of_all_collections does exist');
            this.updateEntryInList(items)
              .then((messageFromUpdateEntryInList) => {
                this.collectionExists = true;
                this.collectionIsActive = true;
                successResponse.description = messageFromUpdateEntryInList;
                resolve(successResponse);
              })
              .catch((messageFromUpdateEntryInList) => {
                failureResponse.description = messageFromUpdateEntryInList;
                reject(failureResponse);
              });
          }
        })
        // if the Library is called for the first time
        // then create a file list_of_all_collections.json to store details of all collections,
        // it will help us in knowing whether a collection is active or not
        .catch(() => {
          let items = [];
          const item = {
            name: this.collectionName,
            isActive: true
          }
          items.push(item);
          // console.log('Library is being called for the first time');
          this.updateEntryInList(items)
            .then((messageFromUpdateEntryInList) => {
              this.collectionExists = true;
              this.collectionIsActive = true;
              successResponse.description = messageFromUpdateEntryInList;
              resolve(successResponse);
            })
            .catch((messageFromUpdateEntryInList) => {
              failureResponse.description = messageFromUpdateEntryInList;
              reject(failureResponse);
            });
        });
    });
  }

  // get current status of the collection
  getCollectionStatus() {
    console.log(this.collectionName, this.collectionExists, this.collectionIsActive);
  }

  dropCollection() {
    return new Promise((resolve, reject) => {
      // if collection exists and is active
      if(this.collectionExists && this.collectionIsActive) {
        // get the list of collections
        blockstack.getFile(this.LIST_OF_ALL_COLLECTIONS, this.encrypt_decrypt)
          .then((fileText) => {
            const content = JSON.parse(fileText);

            let items = [];
            // update this collection to be inactive
            content.forEach((eachCollection) => {
              if(eachBrickset.name === this.collectionName){
                eachBrickset.isActive = false;
              }

              items.push(eachCollection);

              this.updateEntryInList(items)
                .then((messageFromUpdateEntryInList) => {
                  this.collectionIsActive = false;
                  successResponse.description = SOFT_DELETED_THE_COLLECTION;
                  successResponse.moreDescription = messageFromUpdateEntryInList;
                  resolve(successResponse);
                })
                .catch((messageFromUpdateEntryInList) => {
                  failureResponse.description = `${SOME_PROBLEM_OCCURED}: ${messageFromUpdateEntryInList}`;
                  reject(failureResponse);
                });
            });
          })
          .catch((err) => {
            failureResponse.description = `${ERROR_IN_DROPING_COLLECTION}: ${err}`;
            reject(failureResponse);
          });
      } else {
        if (!this.collectionIsActive){
          successResponse.description = ALREADY_INACTIVE_COLLECTION;
        } else {
          successResponse.description = COLLECTION_DOESNT_EXIST;
        }
        resolve(successResponse);
      }
    });
  }

  // common code to update list_of_all_collections.json
  updateEntryInList(items) {
    return new Promise((resolve, reject) => {
      blockstack.putFile(this.LIST_OF_ALL_COLLECTIONS, JSON.stringify(items), this.encrypt_decrypt)
        .then(() => {
          let message = LIST_UPDATED;
          resolve(message);
        })
        .catch((err) => {
          let message = `${ERROR_LIST_NOT_UPDATED} : ${err}`;
          reject(message);
        });
    });
  }

}

export default Collection;
