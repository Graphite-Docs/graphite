import { getGlobal, setGlobal } from 'reactn';
import { fetchData } from '../../shared/helpers/fetch';
const blockstack = require("blockstack");

export function fetchSharedDocs() {
    const { userSession } = getGlobal();
    let contacts = getGlobal().contacts;
    asyncForEach(contacts, async contact => {
        const userToLoadFrom = contact.contact;
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
        if(sharedCollection) {
            let decryptedContent = JSON.parse(userSession.decryptContent(sharedCollection, {privateKey: privateKey}));
            let filteredDocs = decryptedContent.filter(a => a.sharedBy);
            setGlobal({ sharedDocs: getGlobal().sharedDocs.concat(filteredDocs)});
        }
    })
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }