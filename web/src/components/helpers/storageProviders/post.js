import Dropbox from "dropbox";
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
  }
}
