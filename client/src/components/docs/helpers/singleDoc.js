import {setGlobal, getGlobal} from 'reactn';
import { Value } from 'slate';
import { fetchData } from "../../shared/helpers/fetch";
import { postData } from "../../shared/helpers/post";
const initialTimeline = require('../views/editors/initialTimeline.json');

var timer = null;
export async function handleChange(change) {
    await setGlobal({
      content: change.value
    });
    let singleDoc = await getGlobal().singleDoc;
    singleDoc["content"] = getGlobal().content;
    singleDoc["title"] = getGlobal().title;
    singleDoc["myTimeline"] = getGlobal().myTimeline;
    clearTimeout(timer); 
    timer = setTimeout(saveDoc, 3000);
}

export async function saveDoc() {
    setGlobal({ autoSave: "Saving" })
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
  const file = `/documents/${window.location.href.split('documents/')[1]}.json`
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