import axios from "axios";
import { encryptContent, getPublicKeyFromPrivate } from "blockstack";
const IPFS = require("ipfs");
const OrbitDB = require("orbit-db");
const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
};
const ipfs = new IPFS(ipfsOptions);
// const uuidv4 = require("uuid/v4");

let dbAddress;

export async function handleStorage() {
  //first we connect to the selected storage provider.
  let code;
  let link;
  if(window.location.href.includes('google')) {
    code = await window.location.href.split("code=")[1].split("&")[0];
    link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthDev";
  } else if(window.location.href.includes('dropbox')) {
    code = await window.location.href.split("code=")[1].split("#")[0];
    link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/dropboxAuthDev";
  } else if(window.location.href.includes('box-1')) {
    code = await window.location.href.split("code=")[1].split("#")[0];
    link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/boxAuthDev"
  }

  await axios
    .post(
      link,
      code
    )
    .then(res => {
      console.log(res);
      localStorage.setItem("oauthData", JSON.stringify(res));
    })
    .catch(error => console.log(error));

  //then we encrypt the refreshToken;
  let data = await JSON.parse(localStorage.getItem("oauthData")).data
    .refresh_token ? JSON.parse(localStorage.getItem("oauthData")).data
      .refresh_token : JSON.parse(localStorage.getItem("oauthData")).data
        .access_token;
  let privateKey;
  let authProvider = await JSON.parse(localStorage.getItem("authProvider"));
  if (authProvider === "uPort") {
    privateKey = await JSON.parse(
      JSON.parse(localStorage.getItem("connectState"))
    ).keypair.privateKey;
  }
  let publicKey = await getPublicKeyFromPrivate(privateKey);
  let encryptedRefreshToken = await encryptContent(JSON.stringify(data), {
    publicKey: publicKey
  });

  //Next we need to generate an orbitDB database and save the refresh token to it.

  ipfs.on("ready", async () => {
    const orbitdb = await new OrbitDB(ipfs);
    const db = await orbitdb.docs("graphite");
    dbAddress = await db.address.toString();
    //saving the token here:
    await db.put({
      _id: "refresh",
      refresh_token: encryptedRefreshToken
    });

    //then we add the encrypted blob as part of the profile object which we'll create here.
    let did;
    let didProfile;

    //Need to conditionally set the storage provider so we can add it to the profile.
    let storageProvider = window.location.href.split('state=')[1].split('&')[0];

    //Access to the did and profile depends on authProvider.
    if (authProvider === "uPort") {
      did = JSON.parse(localStorage.getItem("uPortUser")).payload.did;
      didProfile = JSON.parse(localStorage.getItem("uPortUser")).payload;
    }

    const profile = {
      did: did,
      profile: didProfile,
      db: dbAddress,
      storageProvider: storageProvider,
      refreshToken: encryptedRefreshToken
    };

    await this.makeProfile(profile);
  });
}
