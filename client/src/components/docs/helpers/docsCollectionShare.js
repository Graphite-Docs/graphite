import { getGlobal, setGlobal } from 'reactn';
import { fetchData } from '../../shared/helpers/fetch';
import update from 'immutability-helper';
import { postData } from '../../shared/helpers/post';
import { encryptContent } from 'blockstack';
import { loadData } from '../../shared/helpers/accountContext';
import { ToastsStore} from 'react-toasts';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { Value } from 'slate';

export async function sharedInfo(params) {
    const { userSession } = getGlobal();
    setGlobal({ shareModalOpen: false});
    ToastsStore.success(`Sharing document...`)
    let key;
    let user = params.contact.contact ? params.contact.contact : params.contact.id;

    if(params.realTime !== undefined) {
      setGlobal({ rtc: params.realTime });
    } else {
      setGlobal({ rtc: true })
    }

    setGlobal({ receiverID: user })
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
    if(key) {
      const sharedCollectionFile = 'shareddocs.json'
      const sharedCollectionName = `mine/${key}/${sharedCollectionFile}`;
      try {
        let sharedCollectionParams = {
          fileName: sharedCollectionName,
          decrypt: true
        }
        let sharedDocs = await fetchData(sharedCollectionParams);
        if(sharedDocs) {
          setGlobal({ sharedCollection: JSON.parse([sharedDocs]) });
        } else {
          setGlobal({ sharedCollection: [] });
        }
      }
      catch(error) {
        console.log(error);
      }
      //Step Three: Load the actual doc to be shared unless we are on the singleDoc page already
      if(params.single) {
        //Do nothing for now
      } else {
        const fullFile = `/documents/${params.doc.id}.json`;
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
      }
      //Step Four: Update shared with array for this doc
      await setGlobal({ sharedWith: [...getGlobal().singleDoc.sharedWith, getGlobal().receiverID] });

      let value = await getGlobal().documents;
      let index = await value.map((x) => {return x.id }).indexOf(params.doc.id);
      
      let singleDoc = await getGlobal().singleDoc;
      setGlobal({ content: Value.fromJSON(singleDoc.content)})
      singleDoc["sharedWith"] = await getGlobal().sharedWith;
      singleDoc["rtc"] = await getGlobal().rtc;
      const object = {};
      object.id = singleDoc.id;
      object.title = singleDoc.title;
      if (getGlobal().rtc) {
        let content = getGlobal().content;
        object.content = content.toJSON();
      } else {
        object.content = document.getElementsByClassName("editor")[0].innerHTML;
      }
      object.readOnly = getGlobal().rtc ? false : true;
      object.dateShared = getMonthDayYear();
      object.sharedBy = userSession.loadUserData().username;

      const updatedDocs = update(getGlobal().documents, {$splice: [[index, 1, singleDoc]]});
      await setGlobal({
        documents: updatedDocs, 
        singleDoc, 
        sharedCollection: [...getGlobal().sharedCollection, object]
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
        ToastsStore.error(`Error sharing with ${user}. They may not have logged in before. You can create a public link instead.`)
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
        const singleDocFile = params.doc.id;
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
    } else {

      ToastsStore.error(`Error sharing with ${user}. They may not have logged in before. You can create a public link instead.`)
    }
  }