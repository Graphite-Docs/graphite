import {
  loadUserData,
  putFile
} from 'blockstack';
const { getPublicKeyFromPrivate } = require('blockstack');

export function savePubKey() {
  const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey)
  putFile('key.json', JSON.stringify(publicKey), {encrypt: false})
  .then(() => {
      console.log("Saved!");
      console.log(JSON.stringify(publicKey));
    })
    .catch(e => {
      console.log(e);
    });
}
