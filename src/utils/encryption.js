import { encrypt, decrypt } from 'eciesjs'
const CryptoJS = require('crypto-js');

export const getPrivateKey = () => {
  const key = localStorage.getItem("key");
  const bytes = CryptoJS.AES.decrypt(key, process.env.REACT_APP_KEY_ENCRYPTION_SECRET);
  const privateKey = bytes.toString(CryptoJS.enc.Utf8);
  return privateKey;
}

export const encryptData = (pubKey, data) => {
  const dataToEncrypt = Buffer.from(data);
  return encrypt(pubKey, dataToEncrypt)
}

export const decryptData = (privKey, data) => {
  const dataToDecrypt = JSON.parse(data);
  return decrypt(privKey, Buffer.from(dataToDecrypt)).toString();
}