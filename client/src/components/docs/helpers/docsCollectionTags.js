import {getGlobal, setGlobal} from 'reactn';
import { postData } from '../../shared/helpers/post';
import { fetchData } from '../../shared/helpers/fetch';
import update from 'immutability-helper';
import { loadData } from '../../shared/helpers/accountContext';
import { ToastsStore} from 'react-toasts';

//Using this to get the right tags and right file
export async function loadSingleDoc(doc) {
    //First, let's set the tags we already know about from the document index file
    let value = await getGlobal().documents;
    let index = await value.map((x) => {return x.id }).indexOf(doc.id);
    setGlobal({singleDocTags: value[index].singleDocTags});
    try {
        let fileName = `/documents/${doc.id}.json`
        let docParams = {
            fileName, 
            decrypt: true
        }
        let singleDoc = await fetchData(docParams);
        setGlobal({singleDoc: JSON.parse(singleDoc)})
    }
    catch(error) {
        console.log(error)
    }
}

export function handleTagChange(e) {
    setGlobal({ tag: e.target.value});
}

export async function deleteTag(tag) {
    let tags = getGlobal().singleDocTags;
    let index = await tags.map((x) => {return x }).indexOf(tag);
    tags.splice(index, 1);
    setGlobal({singleDocTags: tags})
}

export function addTagManual() {
    setGlobal({
        singleDocTags: [...getGlobal().singleDocTags, getGlobal().tag], tag: ""
    })
}

export function checkKey(event) {
    if(event.key === "Enter") {
        if(getGlobal().tag !== "") {
            addTagManual();
        }
    }
}

export async function saveTags() {
    setGlobal({tagModalOpen: false})
    ToastsStore.success(`Saving tags...`)
    let singleDoc = getGlobal().singleDoc;
    singleDoc["singleDocTags"] = getGlobal().singleDocTags;
    //Save the single Doc first
    try {
        let file = `/documents/${singleDoc.id}.json`
        let singleDocParams = {
            fileName: file, 
            body: JSON.stringify(singleDoc), 
            encrypt: true
        }
        let updatedSingleDoc = await postData(singleDocParams)
        console.log(updatedSingleDoc)
    } catch(error) {
        console.log(error)
    }
    //Then update the doc collection and save it
    let value = await getGlobal().documents;
    let doc = getGlobal().singleDoc;
    let index = await value.map((x) => {return x.id }).indexOf(doc.id);
    const updatedDocs = update(getGlobal().documents, {$splice: [[index, 1, singleDoc]]});
    await setGlobal({
      documents: updatedDocs
    })
    try {   
        let file = 'documentscollection.json';
        let docsParams = {
            fileName: file, 
            body: JSON.stringify(getGlobal().documents), 
            encrypt: true
        }
        const updatedDocIndex = await postData(docsParams);
        console.log(updatedDocIndex);
        ToastsStore.success(`Tags saved!`)
        loadData({refresh: false})
    } catch(error) {
        console.log(error)
    }
}



