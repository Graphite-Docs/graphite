import axios from "axios";
const keys = require('../../helpers/keys');

export async function makeProfile(profile) {

  // Post the mongo db
  const post = await axios
    .post(
      "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/make_profile",
      JSON.stringify(profile)
    )
    .then((res) => {
      console.log(res)
      if(res.data.length > 0) {
        localStorage.setItem('profileFound', JSON.stringify(true))
        return true;
      } else {
        // Start the IPFS process here.
        if(profile.create) {
          postToIPFS(profile);
          localStorage.setItem('profileFound', JSON.stringify(true))
          return true;
        }
      }
    })
    .catch((error) => {
      console.log(error)}
      //TODO: Here we should fall back on an IPFS Pinata query.
    );

    return post;
}

export async function postToIPFS(profile) {
  //post to IPFS and pin it using Pinata
  console.log("Saving profile to IPFS...")

  const jsonBody = {
    pinataMetadata: {
        name: 'ProfileEntry',
        keyvalues: {
            ID: profile.did,
            date: profile.profileLastUpdated
        }
    },
    pinataContent: {
        profile: profile
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
    window.location.replace('/')
  })
  .catch(error => console.log(error))
}
