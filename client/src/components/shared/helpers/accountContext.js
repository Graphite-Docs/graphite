import { setGlobal } from 'reactn';
import { fetchData } from "./fetch";

export async function loadData(params) {
    if(params) {
        setGlobal({ loading: false })
    } else {
        setGlobal({ loading: true })
    }
    
    const docsParams = {
        fileName: 'documentscollection.json', 
        decrypt: true
    }
    const contactsParams = {
        fileName: 'contact.json', 
        decrypt: true
    }
    const filesParams = {
        fileName: 'uploads.json',
        decrypt: true
    }
    // const formsParams = {

    // }
    let docs = await fetchData(docsParams);
    let oldFile;
    let isArr = Object.prototype.toString.call(JSON.parse(docs)) === '[object Array]';
    //older versions of the doc collection stored the entire state object at the time. Need to check for that
    if(isArr === true) {
        oldFile = false
    } else {
        oldFile = true;
    }

    let contacts = await fetchData(contactsParams);
    let oldContactsFile;
    let isContactsArr = Object.prototype.toString.call(JSON.parse(contacts)) === '[object Array]';
    //older versions of the contacts collection stored the entire state object at the time. Need to check for that
    if(isContactsArr === true) {
        oldContactsFile = false
    } else {
        oldContactsFile = true;
    }
    
    let files = await fetchData(filesParams);
    setGlobal({
        documents: JSON.parse(docs) ? oldFile === true ? JSON.parse(docs).value : JSON.parse(docs) : [], 
        filteredDocs: JSON.parse(docs) ? oldFile === true ? JSON.parse(docs).value : JSON.parse(docs) : [],
        contacts: JSON.parse(contacts) ? oldContactsFile === true ? JSON.parse(contacts).contacts : JSON.parse(contacts) : [],
        filteredContacts: JSON.parse(contacts) ? oldContactsFile === true ? JSON.parse(contacts).contacts : JSON.parse(contacts) : [],
        files: JSON.parse(files) || [],
        filteredFiles: JSON.parse(files) || [],
        loading: false
    })

    
    
    // await fetchData(formsParams);
}