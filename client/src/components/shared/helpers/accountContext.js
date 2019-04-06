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
    let contacts = await fetchData(contactsParams);
    let files = await fetchData(filesParams);

    setGlobal({
        documents: JSON.parse(docs), 
        filteredDocs: JSON.parse(docs),
        contacts: JSON.parse(contacts).contacts, 
        filteredContacts: JSON.parse(contacts),
        files: JSON.parse(files),
        filteredFiles: JSON.parse(files),
        loading: false
    })

    
    
    // await fetchData(formsParams);
}