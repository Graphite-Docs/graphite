import TurtleDB from "turtledb";
import { putFile, getFile, encryptContent, decryptContent } from "blockstack";
const IPFS = require("ipfs");
const node = new IPFS();

export async function storeFile(options) {
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
  }).catch(error => {
    mydb.update(options.filename, {data: JSON.stringify(storedData) }).then(() => {
      mydb.read(options.filename).then((doc) => console.log(doc));
    })
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
  const mydb = new TurtleDB("graphite-docs");
  if(options.local) {
    return mydb.read(options.filename).then((doc) => {
      if(options.decrypt) {
        if(options.key) {
          return decryptContent(JSON.parse(doc.data), {privateKey: options.key});
        } else {
          return decryptContent(JSON.parse(doc.data));
        }
      } else {
        return JSON.parse(doc.data);
      }
    });
  } else if(options.ipfs) {
    const fileBuffer = await node.files.cat(options.hash)
    if(options.decrypt) {
      if(options.key) {
        decryptContent(JSON.parse(fileBuffer), { privateKey: options.key });
      } else {
        decryptContent(JSON.parse(fileBuffer))
      }
    } else {
      return JSON.parse(fileBuffer);
    }
  } else if(options.gaia) {
    return getFile(options.filename, {decrypt: false}).then((data) => {
      if(options.decrypt) {
        if(options.key) {
          return decryptContent(JSON.parse(data), { privateKey: options.key });
        } else {
          return decryptContent(JSON.parse(data));
        }
      } else {
        return JSON.parse(data);
      }
    })
  }
}
