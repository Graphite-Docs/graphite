import Dropbox from "dropbox";
import Dexie from 'dexie';
import axios from 'axios';
const keys = require('../../helpers/keys');
const fetch = require("isomorphic-fetch"); // or another library of choice.

export async function postToStorageProvider(params) {
  //Here we need to figure out what the storage provider is then we need to:
  //1: Grab the access token
  //2: Verify the access token is valid.
  //3: If not valid, grab refresh token and use it to get a new access token and refresh token.
  //4: Post data.

  if (params.provider === "dropbox") {
    const dbx = new Dropbox({
      accessToken: params.token,
      fetch: fetch
    });
    dbx
      .filesUpload({
        path: params.filePath,
        contents: JSON.stringify(params.content),
        mode: "overwrite"
      })
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.error(error);
      });
  } else if(params.provider === 'google') {
    //First we need to use the refreshToken to get a new access token.
      //If the refresh token fails, we need to re-authenticate the user. 
      const refreshToken = JSON.parse(localStorage.getItem('oauthData'));
      return axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/google-refresh-access-token', refreshToken)
        .then(async (res) => {
          console.log(res.data.access_token);
          let token = res.data.access_token;
          let fileId;
          //Now we can use the resulting token to make our post call.
          //There are different actions to be taken if the file exists and needs to be updated
          if(params.update) {
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

            var settings2 = {
              "async": true,
              "crossDomain": true,
              "url": `https://www.googleapis.com/upload/drive/v3/files/${fileId}`,
              "method": "PATCH",
              "headers": {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Cache-Control": "no-cache",
                "Postman-Token": "83c833e2-27ce-5612-2f18-46f4921cc411"
              },
              "processData": false,
              "data": JSON.stringify(params.content)
            }
            
           await window.$.ajax(settings2).done(function (response2) {
              console.log(response2);
            });
          } else {
            var settings3 = await {
              "async": true,
              "crossDomain": true,
              "url": "https://www.googleapis.com/upload/drive/v3/files",
              "method": "POST",
              "headers": {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Cache-Control": "no-cache",
                "Postman-Token": "e243df4f-f022-e552-79c4-a395ab90d99e"
              },
              "processData": false,
              "data": JSON.stringify(params.content)
            }
            await window.$.ajax(settings3).done(async function (response3) {
              console.log(response3);
              const updatedName = {
                name: params.filePath
              }
              var settings4 = await {
                "async": true,
                "crossDomain": true,
                "url": `https://www.googleapis.com/drive/v3/files/${response3.id}`,
                "method": "PATCH",
                "headers": {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                  "Cache-Control": "no-cache",
                  "Postman-Token": "08b84335-7ac0-e8ba-482e-2c81d7e6a4ea"
                },
                "processData": false,
                "data": JSON.stringify(updatedName)
              }
              console.log("updating file name")
              await window.$.ajax(settings4).done(function (response4) {
                console.log(response4);
                return response4
              });
            });
          }
        })
        .catch(error => {
          console.log(`${error}: Refresh token no longer valid. Let's re-authenticate`)
          //This is where we should give off the re-authentication flow.
        });
  } else if(params.provider === 'ipfs') {
    //post to IPFS and pin it using Pinata
    console.log("Saving to IPFS...")

    const jsonBody = {
      pinataMetadata: {
          name: 'Data',
          keyvalues: {
              ID: params.filePath,
              date: Date.now()
          }
      },
      pinataContent: {
          content: params.content
      }

    }

  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  await axios.post(url, jsonBody, {
    headers: {
      'pinata_api_key': keys.PINATA_API_KEY,
      'pinata_secret_api_key': keys.PINATA_SECRET_API_KEY
    }
  })
  .then((response) => {
    console.log("Saved to the distributed web!")
    console.log(response)
  })
  .then(async () => {
    //Now we need to fetch our pins, filtered by this particular file
    const url = `https://api.pinata.cloud/data/userPinList/hashContains/*/pinStart/*/pinEnd/*/unpinStart/*/unpinEnd/*/pinSizeMin/*/pinSizeMax/*/pinFilter/*/pageLimit/10/pageOffset/0?metadata[keyvalues][ID]={"value":${JSON.stringify(params.filePath)},"op":"eq"}`
    await axios
        .get(url, {
            headers: {
                'pinata_api_key': keys.PINATA_API_KEY,
                'pinata_secret_api_key': keys.PINATA_SECRET_API_KEY
            }
        })
        .then(function (response) {
          console.log(response)
          if(response.data.count > 1) {
            const url = `https://api.pinata.cloud/pinning/removePinFromIPFS`;
            const body = {
              ipfs_pin_hash: response.data.rows[1].ipfs_pin_hash
            };
            //Here we need to grab the older pinned hash and remove it.
            axios
            .post(
                url,
                body,
                {
                    headers: {
                        'pinata_api_key': keys.PINATA_API_KEY,
                        'pinata_secret_api_key': keys.PINATA_SECRET_API_KEY
                    }
                }
            ).then(function (response) {
              console.log("Pins updated.")
            })
            .catch(function (error) {
              console.log(error)
            });
          }

        })
        .catch(function (error) {
          console.log(error)
        });
  })
  .catch(error => console.log(error))
  }

  //Post to dexie first so we have offline capabilities.
  const db = await new Dexie('graphite-docs');
  if (params.filePath.includes('documents')) {
    try {
      await db.version(1).stores({documents: 'id'});
      await db.documents.put({
        id: params.filePath,
        content: JSON.stringify(params.content)
      })
    } catch(err) {
      console.log(err)
      console.log("Error: You may be browsing in private mode.")
    }
  } else if(params.filePath.includes('vault')) {
    await db.version(1).stores({documents: 'id'});
    await db.documents.put({
      id: params.filePath,
      content: JSON.stringify(params.content)
    })
  } else if(params.filePath.includes('contacts')) {
    await db.version(1).stores({documents: 'id'});
    await db.documents.put({
      id: params.filePath,
      content: JSON.stringify(params.content)
    })
  }
}

export async function postToLocal(params) {
  const db = new Dexie('graphite-docs');
  await db.version(1).stores({documents: 'id'});
  await db.documents.put({
    id: params.filePath,
    content: JSON.stringify(params.content)
  })
}
