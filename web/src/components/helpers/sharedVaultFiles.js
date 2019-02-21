import { setGlobal, getGlobal } from 'reactn';
import {
  getFile,
  putFile,
  loadUserData,
  lookupProfile, 
  decryptContent, 
  encryptContent
} from 'blockstack';
import { fetchFromProvider } from './storageProviders/fetch';
import { postToStorageProvider } from './storageProviders/post';
import { saveVaultCollection } from './vaultFiles';
import { getMonthDayYear } from './getMonthDayYear';
import XLSX from "xlsx";
import { loadVault } from './helpers';
const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
const mammoth = require("mammoth");
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('../vault/rtf-to-html.js');
const Papa = require('papaparse');

export function loadVaultContacts() {
  setGlobal({ loading: true });
  getFile("contact.json", {decrypt: true})
   .then((fileContents) => {
     let file = JSON.parse(fileContents || '{}');
     let contacts = file.contacts;
     if(contacts.length > 0) {
       setGlobal({ contacts: JSON.parse(fileContents || '{}').contacts });
     } else {
       setGlobal({ contacts: [] });
     }
   })
   .then(() => {
     setGlobal({ loading: false });
   })
    .catch(error => {
      console.log(error);
    });
}

export function handleIDChangeVault(e) {
  setGlobal({ senderID: e.target.value })
}

// export function pullData() {
//     fetchData();
//     setGlobal({ hideButton: "hide", loading: "" });
// }

export async function loadSharedVault() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  setGlobal({ loading: true });
  await loadVault();
  setGlobal({ user: window.location.href.split('shared/')[1].split('#')[0] });
  let fileID;
  if(authProvider === 'uPort') {
    fileID = JSON.parse(localStorage.getItem('uPortUser')).payload.did;
  } else {
    fileID = loadUserData().username;
  }
  console.log(fileID);
  let fileString = 'sharedvault.json'
  let file = fileID.replace('.', '_') + fileString;
  const directory = '/shared/' + file;
  const options = { username: window.location.href.split('shared/')[1], zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  if(window.location.href.includes('did:')) {
    if(authProvider === 'uPort') {
      
    } else {
      const privateKey = loadUserData().appPrivateKey;
      //the sharer is a uPort user and thus shared using IPFS. Need to fetch from there. 
      const params = {
        provider: 'ipfs',
        filePath: `${file}`
        };
        //Call fetchFromProvider and wait for response.
    let fetchFile = await fetchFromProvider(params);
    console.log(fetchFile)
    if(fetchFile) {
        const decryptedContent = await JSON.parse(decryptContent(fetchFile.data.pinataContent.content, { privateKey: privateKey }))
        console.log(decryptedContent);
        await setGlobal({ shareFileIndex: decryptedContent, loading: false })
        } else {
        await setGlobal({ shareFileIndex: [], loading: false })
        }
    }
  } else {
    if(authProvider === 'uPort') {
      const privateKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
      getFile(directory, options)
      .then((fileContents) => {
        console.log("file contents: ")
        console.log(fileContents);
        lookupProfile(getGlobal().user, "https://core.blockstack.org/v1/names")
          .then((profile) => {
            let image = profile.image;
            console.log(profile);
            if(profile.image){
              setGlobal({img: image[0].contentUrl})
            } else {
              setGlobal({ img: avatarFallbackImage })
            }
          })
          .catch((error) => {
            console.log('could not resolve profile')
          })
          setGlobal({ shareFileIndex: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) }, () => {
            setGlobal({ loading: false });
          })
          console.log("loaded");
          // saveVaultUser();
      })
        .catch(error => {
          console.log(error);
        });
    } else {
      const privateKey = loadUserData().appPrivateKey;
      getFile(directory, options)
      .then((fileContents) => {
        console.log("file contents: ")
        console.log(fileContents);
        lookupProfile(getGlobal().user, "https://core.blockstack.org/v1/names")
          .then((profile) => {
            let image = profile.image;
            console.log(profile);
            if(profile.image){
              setGlobal({img: image[0].contentUrl})
            } else {
              setGlobal({ img: avatarFallbackImage })
            }
          })
          .catch((error) => {
            console.log('could not resolve profile')
          })
          setGlobal({ shareFileIndex: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) }, () => {
            setGlobal({ loading: false });
          })
          console.log("loaded");
          saveVaultUser();
      })
        .catch(error => {
          console.log(error);
        });
    }
  }
}

export function saveVaultUser() {
  putFile("shareuser.json", JSON.stringify(getGlobal().user), {encrypt: true})
    .then(() => {
      console.log("saved");
    })
    .catch(e => {
      console.log(e);
    });
}

export async function loadSingleSharedVault() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  setGlobal({ loading: true });
  if(window.location.href.includes('did:')) {
    await loadSharedVault();
    let wholeFile = getGlobal().shareFileIndex;
    console.log(wholeFile)
    const thisFile = wholeFile.find((file) => {return file.id.toString() === window.location.href.split('shared/')[1].split('/')[1].split('#')[0]}); //this is comparing strings
    let index = thisFile && thisFile.id;
    console.log(index);
    function findObjectIndex(file) {
        return file.id === index; //this is comparing numbers
    }
    setGlobal({
      name: thisFile && thisFile.name,
      link: thisFile && thisFile.link,
      type: thisFile && thisFile.type,
      index: wholeFile.findIndex(findObjectIndex)
    })
    console.log(getGlobal().name)
    console.log(getGlobal().link)
    console.log(getGlobal().type)
    if (getGlobal().type.includes("word")) {
      var abuf4 = str2ab(getGlobal().link);
      mammoth
        .convertToHtml({ arrayBuffer: abuf4 })
        .then(result => {
          var html = result.value; // The generated HTML
          setGlobal({ content: html });
          console.log(getGlobal().content);
          setGlobal({ loading: "hide", show: "" });
        })
        .done();
    }

    else if (getGlobal().type.includes("rtf")) {
      let base64 = getGlobal().link.split("data:text/rtf;base64,")[1];
      rtfToHTML.fromString(window.atob(base64), (err, html) => {
        console.log(window.atob(base64));
        console.log(html)
        let htmlFixed = html.replace("body", ".noclass");
        setGlobal({ content:  htmlFixed});
        setGlobal({ loading: "hide", show: "" });
      })
    }

    else if (getGlobal().type.includes("text/plain")) {
      let base64 = getGlobal().link.split("data:text/plain;base64,")[1];
      console.log(window.atob(base64));
      setGlobal({ loading: "hide", show: "" });
      setGlobal({ content: window.atob(base64) });
    }

    else if (getGlobal().type.includes("sheet")) {
      // var abuf4 = str2ab(getGlobal().link);
      var wb = XLSX.read(abuf4, { type: "buffer" });
      var first_worksheet = wb.Sheets[wb.SheetNames[0]];
      var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
      console.log(data);
      setGlobal({ grid: data });
      setGlobal({ loading: "hide", show: "" });
    }

    else if (getGlobal().type.includes("csv")) {
      let base64 = getGlobal().link.split("data:text/csv;base64,")[1];
      console.log(Papa.parse(window.atob(base64)).data);
      setGlobal({ grid: Papa.parse(window.atob(base64)).data });
      setGlobal({ loading: "hide", show: "" });
    }

    else {
      setGlobal({ loading: false, show: "" });
    }
  } else {
    let fileID;
    let privateKey;
    if(authProvider === 'uPort') {
      fileID = JSON.parse(localStorage.getItem('uPortUser')).payload.did;
      privateKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
    } else {
      fileID = loadUserData().username;
      privateKey = loadUserData().appPrivateKey;
    }
    let fileString = 'sharedvault.json'
    let file = fileID.replace('.','_') + fileString;
    const directory = '/shared/' + file;
    const user = window.location.href.split('shared/')[1].split('/')[0].split('#')[0];
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    getFile(directory, options)
    .then((fileContents) => {
        setGlobal({ shareFileIndex: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
        console.log("loaded");
        let wholeFile = getGlobal().shareFileIndex;
        console.log(wholeFile)
        const thisFile = wholeFile.find((file) => {return file.id.toString() === window.location.href.split('shared/')[1].split('/')[1].split('#')[0]}); //this is comparing strings
        let index = thisFile && thisFile.id;
        console.log(index);
        function findObjectIndex(file) {
            return file.id === index; //this is comparing numbers
        }
        setGlobal({
          name: thisFile && thisFile.name,
          link: thisFile && thisFile.link,
          type: thisFile && thisFile.type,
          index: wholeFile.findIndex(findObjectIndex)
        })
        console.log(getGlobal().name)
        console.log(getGlobal().link)
        console.log(getGlobal().type)
        if (getGlobal().type.includes("word")) {
          var abuf4 = str2ab(getGlobal().link);
          mammoth
            .convertToHtml({ arrayBuffer: abuf4 })
            .then(result => {
              var html = result.value; // The generated HTML
              setGlobal({ content: html });
              console.log(getGlobal().content);
              setGlobal({ loading: "hide", show: "" });
            })
            .done();
        }

        else if (getGlobal().type.includes("rtf")) {
          let base64 = getGlobal().link.split("data:text/rtf;base64,")[1];
          rtfToHTML.fromString(window.atob(base64), (err, html) => {
            console.log(window.atob(base64));
            console.log(html)
            let htmlFixed = html.replace("body", ".noclass");
            setGlobal({ content:  htmlFixed});
            setGlobal({ loading: "hide", show: "" });
          })
        }

        else if (getGlobal().type.includes("text/plain")) {
          let base64 = getGlobal().link.split("data:text/plain;base64,")[1];
          console.log(window.atob(base64));
          setGlobal({ loading: "hide", show: "" });
          setGlobal({ content: window.atob(base64) });
        }

        else if (getGlobal().type.includes("sheet")) {
          // var abuf4 = str2ab(getGlobal().link);
          var wb = XLSX.read(abuf4, { type: "buffer" });
          var first_worksheet = wb.Sheets[wb.SheetNames[0]];
          var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
          console.log(data);
          setGlobal({ grid: data });
          setGlobal({ loading: "hide", show: "" });
        }

        else if (getGlobal().type.includes("csv")) {
          let base64 = getGlobal().link.split("data:text/csv;base64,")[1];
          console.log(Papa.parse(window.atob(base64)).data);
          setGlobal({ grid: Papa.parse(window.atob(base64)).data });
          setGlobal({ loading: "hide", show: "" });
        }

        else {
          setGlobal({ loading: false, show: "" });
        }
    })
   .then(() => {
     setGlobal({ loading: false })
   })
    .catch(error => {
      console.log(error);
    });
  }
}

export async function handleAddToVault() {
  setGlobal({ loading: true });
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'uPort') {
    await loadVault();
    handleAddToVaultTwo();
  } else {
    getFile("uploads.json", { decrypt: true })
    .then(fileContents => {
      if (fileContents) {
        setGlobal({ files: JSON.parse(fileContents || "{}") });
      } else {
        console.log("No files");
      }
    })
    .then(() => {
      handleAddToVaultTwo();
    })
    .catch(error => {
      console.log(error);
    });
  }
}

export async function handleAddToVaultTwo() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  setGlobal({ show: "hide" });
  setGlobal({ hideButton: "hide", loading: "" });

  const object = {};
  object.link = getGlobal().link;
  object.name = getGlobal().name;
  object.size = getGlobal().size;
  object.type = getGlobal().type;
  object.uploaded = getMonthDayYear();
  object.id = window.location.href.split('shared/')[1].split('/')[1].split('#')[0];

  setGlobal({ files: [...getGlobal().files, object],  singleFile: object }, async () => {
    if(authProvider === 'uPort') {
      //First we share the new vault collection
      const publicKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
      const data = JSON.stringify(getGlobal().sharedCollection);
      const encryptedData = await encryptContent(data, {publicKey: publicKey})
      const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
      let token;
      if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
        token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
      } else {
        token = JSON.parse(localStorage.getItem('oauthData'))
      }
      const params = {
        content: encryptedData,
        filePath: `/vault/index.json`,
        provider: storageProvider,
        token: token, 
        update: true
      }

      let postToStorage = await postToStorageProvider(params);
      await console.log(postToStorage);

      //Now we save the individual new vault file.
      const data2 = JSON.stringify(getGlobal().sharedCollection);
      const encryptedData2 = await encryptContent(data2, {publicKey: publicKey})

      const params2 = {
        content: encryptedData2,
        filePath: `/vault/${object.id}`,
        provider: storageProvider,
        token: token, 
        update: false
      }

      let postToStorage2 = await postToStorageProvider(params2);
      await console.log(postToStorage2);
      window.location.replace('/vault');
    } else {
      setTimeout(saveNewVaultTwo, 300);
    }
  });
}

export function saveNewVaultTwo() {
  const file = window.location.href.split('shared/')[1].split('/')[1].split('#')[0] + '.json';
  putFile(file, JSON.stringify(getGlobal().singleFile), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      saveVaultCollection();
      // window.location.replace("/vault");
    })
    .catch(e => {
      console.log("e");
      console.log(e);

    });
}
