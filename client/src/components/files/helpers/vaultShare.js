import { fetchData } from '../../shared/helpers/fetch';
import { setGlobal, getGlobal } from 'reactn';
import update from 'immutability-helper';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
import { loadData } from '../../shared/helpers/accountContext';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';

export async function sharedVaultInfo(contact, file) {
    const { userSession } = getGlobal();
    setGlobal({sharefileModalOpen: false});
    ToastsStore.success(`Sharing file...`)
    let key;
    const user = contact.contact ? contact.contact : contact.id;
    const userShort = contact.contact ? contact.contact.split('.').join('_') : contact.id.split('.').join('_');
    const fileName = "sharedvault.json";
    //Step One: Load User Key
    try {
        let keyParams = {
            fileName: "key.json",
            options: { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
        }
        let stringKey = await fetchData(keyParams);
        key = JSON.parse(stringKey)
    }
    catch(error) {
       console.log(error) 
    }

    //Step Two Load Shared Collection For Recipient
    try {
        const collectionParams = {
            fileName: userShort + fileName, 
            decrypt: true
        }
        const sharedCollection = await fetchData(collectionParams);
        if(JSON.parse(sharedCollection)) {
            setGlobal({ sharedCollection: JSON.parse(sharedCollection)})
        } else {
            setGlobal({ sharedCollection: []})
        }
    } catch(error) {
        console.log(error)
    }

    //Step Three Load File To Share
    try {
        const singleFileParams = {
            fileName: `${file.id}.json`, 
            decrypt: true
        }
        const singleFile = await fetchData(singleFileParams);
        //Set single file state and set shared with array for that file
        let JSONFile = JSON.parse(singleFile);
        JSONFile["sharedWithSingle"] = [...JSON.parse(singleFile).sharedWithSingle, user];
        JSONFile["sharedBy"] = userSession.loadUserData().username;
        JSONFile["dateShared"] = getMonthDayYear();
        setGlobal({ singleFile: JSONFile, sharedWithSingle: JSONFile.sharedWithSingle, sharedCollection: [...getGlobal().sharedCollection, JSONFile]  });
    } catch(error) {
        console.log(error);
    }

    //Step Four Update Files Index With New Collaborator On Single File
    let files = getGlobal().files;
    const index = files.map((x) => {return x.id }).indexOf(file.id);
    let thisFile = files[index];
    thisFile["sharedWithSingle"] = [...getGlobal().sharedWithSingle, user];
    const updatedFiles = update(getGlobal().files, {$splice: [[index, 1, thisFile]]});
    setGlobal({ files: updatedFiles, filteredFiles: updatedFiles});

    //Step Five Save It All
    try {
        //Saving shared collection for this recipient
        let updatedSharedCollectionParams = {
            fileName: userShort + fileName, 
            encrypt: true, 
            body: JSON.stringify(getGlobal().sharedCollection)
        }
        let postedSharedCollection = await postData(updatedSharedCollectionParams)
        console.log(postedSharedCollection);
    } catch(error) {
        console.log(error);
    }

    try {
        //Saving file index
        let fileIndexParams = {
            fileName: "uploads.json", 
            encrypt: true, 
            body: JSON.stringify(getGlobal().files)
        }

        let postedIndex = await postData(fileIndexParams);
        console.log(postedIndex);
    } catch(error) {
        console.log(error);
    }

    try {
        //Save updated single file
        let singleFileParams = {
            fileName: `${file.id}.json`, 
            encrypt: true, 
            body: JSON.stringify(getGlobal().singleFile)
        }
        let postedSingleFile = await postData(singleFileParams);
        console.log(postedSingleFile);
    } catch(error) {
        console.log(error)
    }

    try {
        //Save share file collection encrypted with recipient's key
        const encryptedData = userSession.encryptContent(JSON.stringify(getGlobal().sharedCollection), {publicKey: key})
        let shareParams = {
            fileName: `/shared/${userShort + fileName}`,
            encrypt: false, 
            body: JSON.stringify(encryptedData)
        }
        let postedEncryptedFile = await postData(shareParams);
        console.log(postedEncryptedFile)
        ToastsStore.success(`File shared with ${user}`)
        loadData({refresh: false});
    } catch(error) {
        console.log(error);
    }
}

export async function loadSharedVaultCollection(contact, file) {

}

export function loadVaultSingle(contact, file) {
    
}