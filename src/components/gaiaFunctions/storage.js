import TurtleDB from "turtledb";
import { putFile, encryptContent } from "blockstack";
const IPFS = require("ipfs");
const node = new IPFS();

export async function newFile(options) {
  const mydb = new TurtleDB("graphite-docs");
  let storedData;
  //if encrypt = true, encrypt data
  if(options.encrypt) {
    //if optional public key is passed, encrypt content with that key
    if(options.key) {
      storedData = encryptContent(options.data, {publicKey: options.key})
    } else {
      //if no optional key passed, encrypt with the blockstack app-specific key
      storedData = encryptContent(options.data)
    }
  } else {
    //if encrypt = false, store just the data
    storedData = options.data;
  }

  //Since we are focusing on offline-first, we always post to indexeddb using turtledb
  mydb.create({ _id: options.filename, data: JSON.stringify(storedData) }).then(() => {
    mydb.read(options.filename).then((doc) => console.log(doc));
  })

  //To prevent too many http request, the sync boolean controls if and when we sync to gaia/ipfs
  if(options.sync) {
    //if ipfs = true, post to ipfs
    if(options.ipfs) {
      return node.files.add({
          path: options.filename,
          content: Buffer.from(JSON.stringify(storedData))
        }).then((res) => {
          putFile(options.filename, JSON.stringify(storedData), {encrypt: false})
          return res;
        })
    } else {
      //if ipfs = false or is missing, only post to gaia
      putFile(options.filename, JSON.stringify(storedData), {encrypt: false})
    }
  }
}

export async function loadFile(options) {
  if(options.ipfs) {

  } else {

  }
}

export async function updateFile(options) {
  if(options.ipfs) {

  } else {

  }
}
