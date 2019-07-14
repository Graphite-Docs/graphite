import { fetchData } from '../../shared/helpers/fetch';
import { getGlobal, setGlobal } from 'reactn';
import { Value } from 'slate';
import { singleDocModel } from '../models/singleDocModel';
import { documentModel } from '../models/documentModel';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
import { serializer } from './deserializer';
import { loadData } from '../../shared/helpers/accountContext';
const uuid = require('uuidv4');

const blockstack = require('blockstack');

export async function loadSharedDoc() {
    const { userSession } = getGlobal();
    const userToLoadFrom = window.location.href.split('&user=')[1].split("&")[0];
    const docId = window.location.href.split('&id=')[1];
    const fileString = 'shareddocs.json';
    const file = blockstack.getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey) + fileString;
    const privateKey = userSession.loadUserData().appPrivateKey;

    const directory = `shared/${file}`;
    const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    
    let params = {
        fileName: directory, 
        options
    }

    let sharedCollection = await fetchData(params);
    let decryptedContent = JSON.parse(userSession.decryptContent(sharedCollection, {privateKey: privateKey}));
    let sharedDocs = decryptedContent;
    let thisDoc = sharedDocs.filter(a => a.id === docId)[0];
    if(thisDoc) {
        setGlobal({
            sharedDoc: thisDoc, 
            title: thisDoc.title, 
            
        })
        if(thisDoc.readOnly === true) {
            setGlobal({
                content: thisDoc.content, 
                readOnly: true, 
                rtc: false
            })
        } else {
            setGlobal({
                content: Value.fromJSON(thisDoc.content), 
                readOnly: false,
                rtc: true
            })
        }
        setGlobal({ loading: false });
    } else {
        setGlobal({
            sharedDoc: {}, 
            title: "Error",
            content: "", 
            loading: false
        })
    }
}

export async function handleAddStatic() {
    ToastsStore.success(`Adding document to collection...`)
    const updates = {
        title: getGlobal().title,
        content: serializer.deserialize(getGlobal().content).toJSON(),
        id: uuid()
    }
    console.log(updates);
    let singleDoc = await singleDocModel(updates)
    const indexModelUpdates = {
        title: getGlobal().title,
        id: updates.id
    }
    let indexFile = await documentModel(indexModelUpdates);
    //Update doc index with this new file and set singleDoc state
    let docs = getGlobal().documents;
    await setGlobal({ documents: [...docs, indexFile ], singleDoc });
    try {
        const indexParams = {
            fileName: "documentscollection.json", 
            encrypt: true, 
            body: JSON.stringify(getGlobal().documents)
        }
        const savedIndex = await postData(indexParams);
        console.log(savedIndex);
    } catch(error) {
        console.log(error);
        ToastsStore.error(`error`)
    }

    try {
        const singleDocParams = {
            fileName: `/documents/${updates.id}.json`, 
            encrypt: true, 
            body: JSON.stringify(getGlobal().singleDoc)
        }
        const savedDoc = await postData(singleDocParams);
        console.log(savedDoc);
        ToastsStore.success(`Document added to collection!`)
        loadData({refresh: false});
    } catch(error) {
        console.log(error);
        ToastsStore.error(`error`)
    }
}