import { setGlobal, getGlobal } from 'reactn';
import {
  putFile, 
  encryptContent
} from 'blockstack';
import { postToStorageProvider } from './storageProviders/post';
import { loadVault } from './helpers';
import {
  getMonthDayYear
} from './getMonthDayYear';
import XLSX from 'xlsx';
const str2ab = require('string-to-arraybuffer');

export function handleVaultDrop(files) {
  if(window.location.href.includes('doc/')) {
  } else {
    setGlobal({ loading: true });
  }
  // this.analyticsRun('vault');

  var file = files[0]
  const reader = new FileReader();
  reader.onload = (event) => {
     const object = {};
     object.file = file;
     object.uploaded = getMonthDayYear();
     object.link = event.target.result;
     object.name = file.name;
     object.size = file.size;
     object.type = file.type;
     object.tags = getGlobal().tags;
     object.sharedWithSingle = getGlobal().sharedWithSingle;
     object.lastModified = file.lastModified;
     object.lastModifiedDate = file.lastModifiedDate;
     object.id = Date.now();
     object.vault = "vault";
     const objectTwo = {};
     objectTwo.uploaded = getMonthDayYear();
     objectTwo.id = object.id;
     objectTwo.lastUpdate = Date.now();
     objectTwo.name = object.name;
     objectTwo.type = object.type;
     objectTwo.tags = getGlobal().tags;
     objectTwo.sharedWithSingle = getGlobal().sharedWithSingle;
     objectTwo.lastModifiedDate = object.lastModifiedDate;
     objectTwo.fileType = "vault";

     setGlobal({id: objectTwo.id, name: objectTwo.name});
     if(object.type.includes('sheet')) {
       var abuf4 = str2ab(object.link)
        var wb = XLSX.read(abuf4, {type:'buffer'});
        setGlobal({ grid: wb.Strings })
        console.log(getGlobal().grid);
        object.grid = getGlobal().grid;
     } else {
       console.log("not a spreadsheet");
     }
     if(object.size > 111048576) {
       handleDropRejected();
     }else {
       setGlobal({singleFile: object, files: [...getGlobal().files, objectTwo], link: object.link, file: object.file }, () => {
         saveNewVaultFile();
       });
     }
 };
 reader.readAsDataURL(file);
}

export function handleDropRejected(files) {
 console.log("Error file too large");
 // Materialize.toast('Sorry, your file is larger than 1mb', 4000) // 4000 is the duration of the toast
}

export async function saveNewVaultFile() {
    const authProvider = JSON.parse(localStorage.getItem('authProvider'));
    const file = getGlobal().id + '.json';
    if(authProvider === 'uPort') {
      const publicKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
      const data = JSON.stringify(getGlobal().singleFile);
      const encryptedData = await encryptContent(data, {publicKey: publicKey})
      const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
      let token;
      if(localStorage.getItem('oauthData')) {
        if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
          token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
        } else {
          token = JSON.parse(localStorage.getItem('oauthData'))
        }
      } else {
        token = "";
      }
      const params = {
        content: encryptedData,
        filePath: `/vault/${file}`,
        provider: storageProvider,
        token: token,
        update: false
      }

      let postToStorage = await postToStorageProvider(params);
      await console.log(postToStorage);

      //Now update vault index file.
      const data2 = JSON.stringify(getGlobal().files);
      const encryptedData2 = await encryptContent(data2, {publicKey: publicKey})
      const params2 = {
        content: encryptedData2,
        filePath: `/vault/index.json`,
        provider: storageProvider,
        token: token, 
        update: true
      }

      let postVaultIndex = await postToStorageProvider(params2);
      await console.log(postVaultIndex);
      await setTimeout(loadVault, 1000);
    } else {
      putFile(file, JSON.stringify(getGlobal().singleFile), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        saveNewVaultFileTwo();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        setGlobal({ loading: false });
      });
    }
  }

  export function saveNewVaultFileTwo() {
    putFile("uploads.json", JSON.stringify(getGlobal().files), {encrypt:true})
      .then(() => {
        loadVault();
        setGlobal({ loading: false })
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        setGlobal({ loading: false });
      });
  }
