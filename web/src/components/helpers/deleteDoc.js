import {
  getFile,
  putFile, 
  encryptContent
} from 'blockstack';
import {setGlobal, getGlobal} from 'reactn';
import { deleteFromStorageProvider } from './storageProviders/delete';
import { postToStorageProvider } from './storageProviders/post';

export function loadDocToDelete() {
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
      if(JSON.parse(fileContents).value) {
        setGlobal({ value: JSON.parse(fileContents || '{}').value })
        console.log("loaded");
      } else {
        setGlobal({ value: JSON.parse(fileContents || '{}') })
        console.log("loaded");
      }
   }).then(() =>{
     let value = getGlobal().value;
     const thisDoc = value.find((doc) => { return doc.id.toString() === window.location.href.split('/documents/doc/delete/')[1]}); //comparing strings
     let index = thisDoc && thisDoc.id;
     console.log('index is ' + index)
     function findObjectIndex(doc) {
         return doc.id === index; //comparing numbers
     }
     setGlobal({ content: thisDoc && thisDoc.content, title: thisDoc && thisDoc.title, index: value.findIndex(findObjectIndex) })
   })
    .catch(error => {
      console.log(error);
    });
    const file = window.location.href.split('/documents/doc/delete/')[1];
    const fullFile = '/documents/' + file + '.json';
    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       console.log(fileContents);
        setGlobal({
          singleDoc: JSON.parse(fileContents || '{}')
       })
     })
      .catch(error => {
        console.log(error);
      });
}

export function handleDeleteDoc(props) {
  setGlobal({loading: true});
  let value = getGlobal().value;
  const thisDoc = value.find((doc) => { return doc.id === props.id});
  let index = thisDoc && thisDoc.id;
  function findObjectIndex(doc) {
      return doc.id === index; //comparing numbers
  }
  setGlobal({ content: thisDoc && thisDoc.content, title: thisDoc && thisDoc.title, index: value.findIndex(findObjectIndex) }, () => {
    if(getGlobal().index > -1) {
      value.splice(getGlobal().index,1);
    } else {
      console.log("Error with index")
    }

    setGlobal({ value: value, singleDoc: {}, deleteDoc: true, loading: "show", save: "hide", action: "Deleted document: " +  props.id}, () => {
      this.saveNewDocFile(props);
    })
  })

};

export async function saveNewDocFile(props) {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'blockstack') {
    putFile("documentscollection.json", JSON.stringify(getGlobal().value), {encrypt: true})
    .then(() => {
      this.saveDocFileTwo(props);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  } else {
    const publicKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
    const data = JSON.stringify(getGlobal().value);
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
      filePath: '/documents/index.json',
      provider: storageProvider,
      token: token, 
      update: true
    }

    //Update Index File.
    let postToStorage = await postToStorageProvider(params);
    await console.log(postToStorage);
    //Actually delete single doc file, don't just save empty object.
    const singleData = await JSON.stringify(getGlobal().singleDoc);
    const singleParams = await {
      content: singleData,
      filePath: `/documents/single/${props.id}.json`,
      provider: storageProvider,
      token: token
    }
    let deleteSingle = await deleteFromStorageProvider(singleParams)
    await console.log(deleteSingle);
    setGlobal({loading: false})
  }
}

export function saveDocFileTwo(props) {
  const file = props.id;
  const fullFile = '/documents/' + file + '.json';
  putFile(fullFile, JSON.stringify(getGlobal().singleDoc), {encrypt:true})
    .then(() => {
      window.location.href = '/documents';
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}
