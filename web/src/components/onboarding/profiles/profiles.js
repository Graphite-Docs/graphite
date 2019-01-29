import axios from "axios";
const IPFS = require("ipfs");
const OrbitDB = require("orbit-db");
const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
};
const ipfs = new IPFS(ipfsOptions);

export async function makeProfile(profile) {

  //Post the mongo db
  axios
    .post(
      "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/make_profile",
      JSON.stringify(profile)
    )
    .catch(error => console.log(error));

  ipfs.on("ready", async () => {
    const orbitdb = await new OrbitDB(ipfs);
    const access = {
      // Setup write access
      write: ["*"]
    };
    const db = await orbitdb.docs("/orbitdb/QmaNuS31v5pYKEqS1iu9adEnSyvgwr4aNxrSdn7X7y9BAo/graphite-profiles", access);
    //saving the token here:
    await db.put({
      _id: profile.did,
      profile: profile,
      db: profile.db,
      storageProvider: profile.storageProvider,
      refreshToken: profile.refreshToken
    });
  });
}
