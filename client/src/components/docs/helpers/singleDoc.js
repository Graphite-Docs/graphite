import {setGlobal, getGlobal} from 'reactn';
import { Value } from 'slate';
import { fetchData } from "../../shared/helpers/fetch";
import { postData } from "../../shared/helpers/post";
import update from 'immutability-helper';
import { loadData } from '../../shared/helpers/accountContext';
import { singleDocModel } from '../models/singleDocModel';
const initialTimeline = require('../views/editors/initialTimeline.json');
const uuid = require('uuidv4');

var timer = null;
var versionTimer = null
export async function handleChange(change) {
    await setGlobal({
      content: change.value
    });
    let updates = {
      content: getGlobal().content
    }
    clearTimeout(timer); 
    clearTimeout(versionTimer);
    timer = setTimeout(() => saveDoc(updates), 3000);
    versionTimer = setTimeout(updateVersions, 6000);
}

export async function saveDoc(updates) {
    setGlobal({ autoSave: "Saving" })
    let singleDoc = await singleDocModel(updates);
    setGlobal({ singleDoc: singleDoc });

    let filePath;
    if(window.location.href.includes('new')) {
      filePath = window.location.href.split('new/')[1];
    } else {
      filePath = window.location.href.split('documents/')[1];
    }
    let file = `/documents/${filePath}.json`;
    let docParams = {
        fileName: file, 
        body: JSON.stringify(getGlobal().singleDoc), 
        encrypt: true
    }
    const updatedDoc = await postData(docParams);
    console.log(updatedDoc);
    
    //Now we update the index file;
    let docs = await getGlobal().documents;
    let index = await docs.map((x) => {return x.id }).indexOf(filePath);
    let indexSingleDoc = getGlobal().singleDoc;
    delete indexSingleDoc.content;
    if(index > 0 && window.location.href.includes("new")) {
      await setGlobal({ documents: [...getGlobal().documents, indexSingleDoc]});
    } else {
      const updatedDocs = update(getGlobal().documents, {$splice: [[index, 1, indexSingleDoc]]});
      await setGlobal({documents: updatedDocs});
    }
    
    let indexParams = {
      fileName: 'documentscollection.json', 
      body: JSON.stringify(getGlobal().documents), 
      encrypt: true
    }
    const updatedIndex = await postData(indexParams);
    console.log(updatedIndex);
    loadData({refresh: false});
    setGlobal({ autoSave: "Saved" });
}

export async function handleTitle(e) {
  let title = e.target.value;
  let doc = await getGlobal().singleDoc;
  doc["title"] = title;
  setGlobal({ singlDoc: doc, title: title });
  clearTimeout(timer); 
  timer = setTimeout(saveDoc, 1500);
}

export async function loadSingle() {
  setGlobal({loading: true});
  const file = `/documents/${window.location.href.split('documents/')[1]}.json`;
  const docParams = {
    fileName: file,
    decrypt: true
  }

  let doc = await fetchData(docParams);
  setGlobal({
    singleDoc: JSON.parse(doc), 
    title: JSON.parse(doc).title,
    content: Value.fromJSON(JSON.parse(doc).content),
    loading: false, 
    myTimeline: JSON.parse(doc).myTimeline || initialTimeline
  })
}

export async function updateVersions() {
  let singleDoc = await getGlobal().singleDoc;
  const newVersionId = uuid();
  let file = `documents/versions/${newVersionId}.json`;
    let versionParams = {
        fileName: file, 
        body: JSON.stringify(singleDoc), 
        encrypt: true
    }
    const newVersion = await postData(versionParams);
    console.log(newVersion);
    const versionData = {
      version: newVersionId,
      timestamp: Date.now()
    }
    saveDoc({version: versionData})
}

export async function loadVersion(id) {
  const file = `documents/versions/${id}.json`
  const docParams = {
    fileName: file,
    decrypt: true
  }

  let doc = await fetchData(docParams);
  setGlobal({
    singleDoc: JSON.parse(doc), 
    title: JSON.parse(doc).title,
    content: Value.fromJSON(JSON.parse(doc).content),
    myTimeline: JSON.parse(doc).myTimeline || initialTimeline
  })
}