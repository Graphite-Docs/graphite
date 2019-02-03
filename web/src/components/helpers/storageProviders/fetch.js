// const Dropbox = require('dropbox').Dropbox;
import Dropbox from "dropbox";
const fetch = require("isomorphic-fetch"); // or another library of choice.

export function fetchFromProvider(params) {
  //Here we need to do a few things:
  //1: Grab the accessToken for the storage provider and use that to make the request.
  //2: If the token is expire, we need to provide a refreshToken and get a new access & refresh token.
  //3: If we got new tokens, we need to store those.
  //4: Fetch the appropriate file.
  //TODO: It would probably be smart to use IPFS as a fallback in case of file overwriting or something drastic.
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
        return response
      })
      .catch(error => {
        console.log(error);
        return "error fetching file";
      });
  }
}
