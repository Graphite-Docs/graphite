import { getUserKey } from './shared';
const blockstack = require("blockstack");
// const privateKey = blockstack.makeECPrivateKey();
// const publicKey = blockstack.getPublicKeyFromPrivate(privateKey);
const uuidv4 = require("uuid/v4");
// const scopes = [
//   {
//     scope: "putFilePrefix",
//     domain: "AdminFolder"
//   }
// ];
// const gaiaHubUrl = "https://hub.blockstack.org";
let pubKey;

export async function createTeam(teamName) {
  //First check if shared key exists
  //The check will differ depending on whether the user is the root user or not.
  let name = blockstack.loadUserData().username;
  if (name.split(".").length > 2) {
    //This means the user is not the root user.
    //need to find logged in user's appPubKey
    let userPubKey = blockstack.getPublicKeyFromPrivate(blockstack.loadUserData().appPrivateKey)
    //file name for the root level team key.
    let fileName = `keys/root/teamkey/${userPubKey}.json`;
    //will always be looking this up from root level user.
    let user = `${blockstack.loadUserData().username.split('.')[1]}.${blockstack.loadUserData().username.split('.')[2]}`
    pubKey = getUserKey(fileName, user);
  } else {
    //User is root user, so normal getFile will work.
    let fileName = 'keys/root/teamkey.json';
    await blockstack.getFile(fileName, {decrypt: true})
      .then((file) => {
        if(file) {
          //Check if the key has already been created.
          console.log("Root level team key found.")
          pubKey = blockstack.getPublicKeyFromPrivate(JSON.parse(file));
        } else {
          //Create key if it doesn't exist yet.
          console.log("No root level key found, creating...")
          let privateKey = blockstack.makeECPrivateKey();
          blockstack.putFile(fileName, JSON.stringify(privateKey), {encrypt: true})
            .then(() => {
              console.log("Root level team key created and saved.")
            })
            .catch(error => console.log(error))
        }
      })
  }

  const object = {};
  object.id = uuidv4();
  object.name = teamName;
  object.teamPath = `Teams/${teamName}`;
  object.members = [];
  this.setState({ teams: [...this.state.teams, object] }, () => {
    let data = this.state.teams;
    let file = "Administrators/teams.json";
    let scopesFile = "Administrators";
    this.postData(data, file, scopesFile, pubKey);
  });
}

export function postToSharedBucket() {
  //First we need to check root level access.
  //We will always look up from the root username (eg: acmecompany.graphite)
  //For testing, we can hard-code this as necessary.
  const pubKey = blockstack.getPublicKeyFromPrivate(
    blockstack.loadUserData().appPrivateKey
  );
  const file = pubKey + "/AccessConfig";
  let gaiaConfig;
  blockstack
    .getFile(file, { username: "admin.graphite", decrypt: false })
    .then(file => {
      let privateKey = blockstack.loadUserData().appPrivateKey;
      let content = blockstack.decryptContent(file, {
        privateKey: privateKey
      });
      gaiaConfig = JSON.parse(content);
    })
    .then(() => {
      try {
        blockstack.uploadToGaiaHub("shouldnt-work", "asdf", gaiaConfig);
      } catch (error) {
        console.log("Correctly failed to upload");
      }
      blockstack.uploadToGaiaHub("AdminFolder/should-work", "hi!", gaiaConfig);
      console.log("Write was successful");
    })
    .catch(error => console.log(error));
}
