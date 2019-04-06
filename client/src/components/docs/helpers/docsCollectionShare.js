import { getGlobal, setGlobal } from 'reactn';
import { fetchData } from '../../shared/helpers/fetch';
import update from 'immutability-helper';
import { postData } from '../../shared/helpers/post';
import { encryptContent } from 'blockstack';
import { loadData } from '../../shared/helpers/accountContext';
import { ToastsStore} from 'react-toasts';

export async function sharedInfo(props, doc) {
    setGlobal({ shareModalOpen: false});
    ToastsStore.success(`Sharing document...`)
    let key;
    const user = props.contact;
    setGlobal({ receiverID: props.contact, rtc: true })
    //Step One: Get Contact's Key
    try {
      let keyParams = {
        fileName: "key.json",
        options: { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
      }
      let stringKey = await fetchData(keyParams);
      key = JSON.parse(stringKey)
    }
    catch(error) {
      console.error(error);
    }
    //Step Two: Load user's collection of files shared with recipient
    const sharedCollectionFile = 'shareddocs.json'
    const sharedCollectionName = `mine/${key}/${sharedCollectionFile}`;
    try {
      let sharedCollectionParams = {
        fileName: sharedCollectionName,
        decrypt: true
      }
      let sharedDocs = await fetchData(sharedCollectionParams);
      setGlobal({
        sharedCollection: JSON.parse(sharedDocs) || []
      })
    }
    catch(error) {
      console.log(error);
    }
    //Step Three: Load the actual doc to be shared
    const fullFile = `/documents/${doc.id}.json`;
    try {
      let singleDocParams = {
        fileName: fullFile, 
        decrypt: true
      }
      let singleDoc = await fetchData(singleDocParams);
      let updatedSingleDoc = JSON.parse(singleDoc);

      setGlobal({
        singleDoc: updatedSingleDoc
      })
    }
    catch(error) {
      console.log(error)
    }
    //Step Four: Update shared with array for this doc
    await setGlobal({ sharedWith: [...getGlobal().singleDoc.sharedWith, getGlobal().receiverID] });

    let value = await getGlobal().documents;
    let index = await value.map((x) => {return x.id }).indexOf(doc.id);
    
    let singleDoc = await getGlobal().singleDoc;
    singleDoc["sharedWith"] = await getGlobal().sharedWith;
    console.log(singleDoc);
  
    const updatedDocs = update(getGlobal().documents, {$splice: [[index, 1, singleDoc]]});
    await setGlobal({
      documents: updatedDocs, 
      singleDoc
    })
    //Step Five: Save the shared with collection
    try{
      let saveSharedCollectionParams = {
        fileName: sharedCollectionName, 
        encrypt: true, 
        body: JSON.stringify(getGlobal().sharedCollection)
      }
      let postSharedCollection = await postData(saveSharedCollectionParams);
      if(postSharedCollection) {
        //Toast here
        ToastsStore.success(`Document shared with ${user}`)
      }
    }
    catch(error) {
      console.log(error);
    }
    //Step Six: Encrypt file with recipient's key and save it
    try {
      const shareData = getGlobal().sharedCollection;
      const encryptedData = encryptContent(JSON.stringify(shareData), {publicKey: key})
      const sharedFileName = `shared/${key}${sharedCollectionFile}`;
      const shareSaveFileParams = {
        fileName: sharedFileName, 
        encrypt: false, 
        body: encryptedData
      }
      let postSharedFile = await postData(shareSaveFileParams)
      console.log(postSharedFile);
    }
    catch(error) {
      console.log(error);
    }
    //Step Seven: Now save the original single doc with the new sharedWith array
    try {
      const singleDocFile = doc.id;
      const singleDocFullFile = `/documents/${singleDocFile}.json`
      let saveSingleDocParams = {
        fileName: singleDocFullFile,
        encrypt: true, 
        body: JSON.stringify(getGlobal().singleDoc)
      }
      let postUpdatedSingleDoc = await postData(saveSingleDocParams)
      console.log(postUpdatedSingleDoc);
    }
    catch(error) {
      console.log(error);
    }
    //Step Eight: Save Docs Collection
    try {
      const docsFileName = `documentscollection.json`
      let saveDocsCollectionParams = {
        fileName: docsFileName,
        encrypt: true, 
        body: JSON.stringify(getGlobal().documents)
      }
      let postDocsCollection = await postData(saveDocsCollectionParams)
      console.log(postDocsCollection);
    }
    catch(error) {
      console.log(error);
    }
    loadData({refresh: false});
  }