import { getGlobal, setGlobal } from 'reactn';
import { fetchData } from '../../shared/helpers/fetch';

export function fetchSharedFiles() {
    const { userSession } = getGlobal();
    let contacts = getGlobal().contacts;
    asyncForEach(contacts, async contact => {
        const userToLoadFrom = contact.contact;
        const userShort = userSession.loadUserData().username.split('.').join('_');
        const fileName = "sharedvault.json";
        const privateKey = userSession.loadUserData().appPrivateKey;

        const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
        let params = {
            fileName: `/shared/${userShort + fileName}`, 
            options
        }
    
        let sharedCollection = await fetchData(params);
        if(sharedCollection) {
            let decryptedContent = JSON.parse(userSession.decryptContent(JSON.parse(sharedCollection), {privateKey: privateKey}));
            let filteredFiles = decryptedContent.filter(a => a.sharedBy);
            setGlobal({ sharedFiles: getGlobal().sharedFiles.concat(filteredFiles)});
        }
    })
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }