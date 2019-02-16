import Dropbox from "dropbox";
// import Dexie from 'dexie';
const fetch = require("isomorphic-fetch"); // or another library of choice.

export async function deleteFromStorageProvider(params) {
    //First we delete from local storage.
    // const db = new Dexie('graphite-docs');
    // await db.version(1).stores({documents: 'id'});
    // await db.documents.delete(params.filePath)

    //Now, we need to delete the file from the chosen storage provider
    //If IPFS, we will simple stop pinning the file. 
    if (params.provider === "dropbox") {
        const dbx = new Dropbox({
            accessToken: params.token,
            fetch: fetch
          });
        dbx
          .filesDelete({
            path: params.filePath
          })
          .then(function(response) {
            console.log(response);
          })
          .catch(function(error) {
            console.error(error);
          });
    }
}