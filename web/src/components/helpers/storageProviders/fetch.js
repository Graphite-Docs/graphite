import Dropbox from "dropbox";
import Dexie from "dexie";
import axios from 'axios';
const keys = require('../../helpers/keys');
const fetch = require("isomorphic-fetch"); // or another library of choice.

export async function fetchFromProvider(params) {
  const online = navigator.onLine;
  let localData;
  let returnedObject;
  //First fetch data from indexedDB storage for speed. We should only make an API call if indexedDB fails.
  const db = new Dexie("graphite-docs");
  await db.version(1).stores({
    documents: "id", contacts: "id"
  });

  if(!online) {
    if (params.filePath.includes("documents")) {
      localData = await db.documents.get(params.filePath);
      returnedObject = await {
        data: localData,
        loadLocal: true
      }
      returnedObject = {};
    } else if(params.filePath.includes("contacts")) {
      localData = await db.contacts.get(params.filePath);
      returnedObject = await {
        data: localData,
        loadLocal: true
      }
      returnedObject = {};
    } else {
      returnedObject = {};
    }
  } else {
    returnedObject = {};
  }
  
  //Now, if there is an error with fetching localData we need to do a few things:
  //1: Grab the accessToken for the storage provider and use that to make the request.
  //2: If the token is expire, we need to provide a refreshToken and get a new access & refresh token.
  //3: If we got new tokens, we need to store those.
  //4: Fetch the appropriate file.
  //TODO: It would probably be smart to use IPFS as a fallback in case of file overwriting or something drastic.
  if (!returnedObject.data) {
    //Dropbox
    if (params.provider === "dropbox") {
      //Creating a Dropbox constructor with params from the method call.
      const dbx = new Dropbox({
        accessToken: params.token,
        fetch: fetch
      });
      //Make the Dropbox call here and return it to the file that's calling this function.
      return dbx
        .filesDownload({ path: params.filePath })
        .then(response => {
          console.log(response)
          return response;
        })
        .catch(error => {
          console.log(error);
          return "error fetching file";
        });
    } else if(params.provider === 'ipfs') {
      console.log(params)
      const url = `https://api.pinata.cloud/data/userPinList/hashContains/*/pinStart/*/pinEnd/*/unpinStart/*/unpinEnd/*/pinSizeMin/*/pinSizeMax/*/pinFilter/*/pageLimit/10/pageOffset/0?metadata[keyvalues][ID]={"value":${JSON.stringify(params.filePath)},"op":"eq"}`
      return  axios
          .get(url, {
              headers: {
                  'pinata_api_key': keys.PINATA_API_KEY,
                  'pinata_secret_api_key': keys.PINATA_SECRET_API_KEY
              }
          })
          .then(async (response) => {
            console.log(response.data.rows[0])
            return axios.get(`https://gateway.pinata.cloud/ipfs/${response.data.rows[0].ipfs_pin_hash}`)
              .then((res) => {
                console.log("returning response...");
                return res;
              })
              .catch(error => {
                console.log(error);
              })
          })
          .catch(function (error) {
            console.log(error)
          });
    }

    //Box
    //****Access Tokens expire in 1 hour. Refresh Tokens must be used within 60 days****
    //****Need to handle checking for a refresh token's validity before a user starts taking action.****
    //****Can then send user through a new oauth flow in the least disruptive way.*****

    //Drive

    //IPFS
  } else {
    return returnedObject
  }
}
