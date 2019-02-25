import Dropbox from "dropbox";
import Dexie from "dexie";
import axios from 'axios';
import { setGlobal } from 'reactn';
import { makeProfile } from '../../onboarding/profiles/profiles';
import { encryptContent } from 'blockstack';
const keys = require('../../helpers/keys');
const fetch = require("isomorphic-fetch"); // or another library of choice.

export async function fetchFromProvider(params) {
  const online = navigator.onLine;
  let localData;
  let returnedObject;
  //First fetch data from indexedDB storage for speed. We should only make an API call if indexedDB fails.
  const db = await new Dexie("graphite-docs");
  await db.version(1).stores({
    documents: "id", contacts: "id", vault: "id"
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
    } else if(params.provider === 'google') {
      //First we need to use the refreshToken to get a new access token.
      //If the refresh token fails, we need to re-authenticate the user. 
      const refreshToken = params.token;
      let fileData;
      let token;
      let fileId;
      return await axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/google-refresh-access-token', refreshToken)
        .then(async (res) => {
          console.log(res)
          token = res.data.access_token;
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": `https://www.googleapis.com/drive/v3/files?q=name=%22${params.filePath}%22`,
            "method": "GET",
            "headers": {
              "Authorization": `Bearer ${token}`,
              "Cache-Control": "no-cache",
              "Postman-Token": "ea40b72a-e688-318f-4c57-d5f8a93a487c"
            }
          }
          
          await window.$.ajax(settings).done(async function (response) {
            console.log(response)
            if(response.files.length > 0) {
              fileId = response.files[0].id;
            }
          });

          if(fileId) {
            var settings2 = {
              "async": true,
              "crossDomain": true,
              "url": `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
              "method": "GET",
              "headers": {
                "Authorization": `Bearer ${token}`,
                "Cache-Control": "no-cache",
                "Postman-Token": "c881eec8-7f68-c2e4-80ae-c62a5144ca39"
              }
            }
            
            return await window.$.ajax(settings2).done(async function (response2) {
              fileData = await response2;
              return fileData;
            });
          } else {
            console.log("No file found")
          }
        })
        .catch(error => {
          console.log(`${error}: Refresh token no longer valid. Let's re-authenticate`)
          //This is where we should give off the re-authentication flow.
        });

    } else if(params.provider === 'box-1') {
      console.log(params)
            //First we need to use the refreshToken to get a new access token.
      //If the refresh token fails, we need to re-authenticate the user. 
      const refreshToken = params.token;
      let token;
      // let fileId;
      return await axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/box-refresh-access-token', refreshToken)
        .then(async (res) => {
          console.log(res)
          if(res.data.error === 'invalid_grant') {
            //This is where we should kick off the re-authentication flow.
            //Reauth should only ever happen on first login to the app, not in the middle of working.
            await setGlobal({ reAuth: true, provider: "box" })
          } else {
            token = res.data.access_token;
            let refreshToken = res.data.refresh_token;

            //Because Box's refresh tokens are one-time use, need to update user's profile with new refresh token: 
            let publicKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
            let encryptedRefreshToken = await encryptContent(JSON.stringify(refreshToken), {
              publicKey: publicKey
            });
            let did = JSON.parse(localStorage.getItem("uPortUser")).payload.did;
            let didProfile = {
              name: await JSON.parse(localStorage.getItem("uPortUser")).payload.name,
              did: await JSON.parse(localStorage.getItem("uPortUser")).payload.did
            }
            let storageProvider = JSON.parse(localStorage.getItem('storageProvider'));

            const profile = await {
              did: did,
              profile: didProfile,
              storageProvider: storageProvider,
              refreshToken: encryptedRefreshToken,
              profileLastUpdated: Date.now(),
              publicKey: publicKey,
              create: false,
              update: true 
            };
            await makeProfile(profile);

            //Now we can move on and use the access token.

            var settings = {
              "async": true,
              "crossDomain": true,
              "url": `https://api.box.com/2.0/search?query=%22${params.filePath}%22`,
              "method": "GET",
              "headers": {
                "Authorization": `Bearer ${token}`,
                "Cache-Control": "no-cache",
                "Postman-Token": "66572b11-51a7-abc9-ae87-ed3aafe71aff"
              }
            }
            
            window.$.ajax(settings).done(function (response) {
              console.log(response);
              
            });

            // if(fileId) {
            //   var settings2 = {
            //     "async": true,
            //     "crossDomain": true,
            //     "url": `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            //     "method": "GET",
            //     "headers": {
            //       "Authorization": `Bearer ${token}`,
            //       "Cache-Control": "no-cache",
            //       "Postman-Token": "c881eec8-7f68-c2e4-80ae-c62a5144ca39"
            //     }
            //   }
              
            //   return await window.$.ajax(settings2).done(async function (response2) {
            //     fileData = await response2;
            //     return fileData;
            //   });
            // } else {
            //   console.log("No file found")
            // }
          }
        })
        .catch(async  error => {
          console.log(error)
        });
    } else if(params.provider === 'ipfs') {
      if (params.filePath.includes("documents")) {
        localData = await db.documents.get(params.filePath);
        return returnedObject = await {
          data: localData,
          loadLocal: true
        }
      } else if(params.filePath.includes("contacts")) {
        localData = await db.documents.get(params.filePath);
        if(localData) {
          return returnedObject = await {
            data: localData,
            loadLocal: true
          }
        } else {
          returnedObject = {};
        }
      } else {
        returnedObject = {};
      }


      const url = `https://api.pinata.cloud/data/userPinList/hashContains/*/pinStart/*/pinEnd/*/unpinStart/*/unpinEnd/*/pinSizeMin/*/pinSizeMax/*/pinFilter/*/pageLimit/10/pageOffset/0?metadata[keyvalues][ID]={"value":${JSON.stringify(params.filePath)},"op":"eq"}`
      return  axios
          .get(url, {
              headers: {
                  'pinata_api_key': keys.PINATA_API_KEY,
                  'pinata_secret_api_key': keys.PINATA_SECRET_API_KEY
              }
          })
          .then(async (response) => {
            if(response.data.rows.length > 0) {
              console.log(response)
              console.log(response.data.rows[0])
              return axios.get(`https://gateway.pinata.cloud/ipfs/${response.data.rows[0].ipfs_pin_hash}`)
                .then((res) => {
                  console.log("returning response...");
                  return res;
                })
                .catch(error => {
                  console.log(error);
                })
            }
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
