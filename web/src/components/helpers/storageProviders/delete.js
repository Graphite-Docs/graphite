import Dropbox from "dropbox";
import axios from 'axios';
const fetch = require("isomorphic-fetch"); // or another library of choice.

export async function deleteFromStorageProvider(params) {
    //First we delete from local storage.
    // const db = new Dexie('graphite-docs');
    // await db.version(1).stores({documents: 'id'});
    // await db.documents.delete(params.filePath)

    //Now, we need to delete the file from the chosen storage provider
    //If IPFS, we will simply stop pinning the file. 
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
    } else if(params.provider === 'google') {
      //First we need to fetch the fileId: 
      const refreshToken = JSON.parse(localStorage.getItem('oauthData'));
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

          axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`)
            .then((res) => {
              console.log(res);
            }).catch(error => {
              console.log(error)
            })
    })
  }
}