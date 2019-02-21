import {
  getFile,
  putFile,
  encryptContent
} from 'blockstack';
import { postToStorageProvider } from './storageProviders/post';
import { deleteFromStorageProvider } from './storageProviders/delete';
import { setGlobal, getGlobal } from 'reactn';
import { loadVault } from './helpers';


export function initialDeleteLoad() {
  getFile('uploads.json', {decrypt: true})
    .then((file) => {
      setGlobal({files: JSON.parse(file || '{}') });
      let files = getGlobal().files;
      const thisFile = files.find((file) => {return file.id.toString() === window.location.href.split('delete/')[1]}); //this is comparing strings
      let index = thisFile && thisFile.id;
      console.log("DeleteVaultFile - componentDidMount - index is: ", index);
      function findObjectIndex(file) {
        return file.id === index; //this is comparing numbers
      }
      setGlobal({index: files.findIndex(findObjectIndex)});
    })
    .catch(error => {
      console.log(error);
    })
  const file = window.location.href.split('delete/')[1];
  getFile(file + '.json', {decrypt: true})
   .then((fileContents) => {
     setGlobal({ singleFile: JSON.parse(fileContents || '{}') });
     setGlobal({ name: JSON.parse(fileContents || '{}').name })
   })
    .catch(error => {
      console.log(error);
    });
}

export async function handleDeleteVaultItem(file) {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  let files = getGlobal().files;
  const thisFile = files.find((a) => {return a.id.toString() === file.id.toString()}); //this is comparing strings
  let index = thisFile && thisFile.id;
  function findObjectIndex(a) {
    return a.id === index; //this is comparing numbers
  }
  await setGlobal({index: files.findIndex(findObjectIndex)}, () => {
    if(getGlobal().index > -1) {
      files.splice(getGlobal().index,1);
    } else {
      console.log("Error with index")
    }
  if(authProvider === 'uPort') {
    setGlobal({ files: files, loading: true }, async () => {
      const publicKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
      const data = JSON.stringify(getGlobal().files);
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
        filePath: '/vault/index.json',
        provider: storageProvider,
        token: token, 
        update: true
      }

      let postToStorage = await postToStorageProvider(params);
      await console.log(postToStorage);

      //Now we delete the actual file.
      const singleData = await JSON.stringify(getGlobal().singleFile);
      const singleParams = await {
        content: singleData,
        filePath: `/vault/${file.id}.json`,
        provider: storageProvider,
        token: token
      }
      let deleteSingle = await deleteFromStorageProvider(singleParams)
      await console.log(deleteSingle);
      await setTimeout(loadVault, 1000);
    })
  } else {
    setGlobal({ singleFile: {}, files: files, loading: true }, () => {
      saveVaultDelete(file);
    })
  }
    
  });

};

export function saveVaultDelete(file) {
  putFile("uploads.json", JSON.stringify(getGlobal().files), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      saveVaultDeleteTwo(file);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveVaultDeleteTwo(file) {
  const fileID = file.id;
  putFile(fileID + '.json', JSON.stringify(getGlobal().singleFile), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      // setGlobal({loading: false});
      loadVault();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
      alert(e.message);
    });
}
