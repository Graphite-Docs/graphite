import { fetchData } from "../../shared/helpers/fetch";
import { setGlobal, getGlobal } from 'reactn';

export async function loadSingleSharedVault() {
    const { userSession } = getGlobal();
    setGlobal({ loading: true });
    let fileID = userSession.loadUserData().username;
    // let privateKey = userSession.loadUserData().appPrivateKey; /// Continue here

    let fileString = 'sharedvault.json'
    let file = fileID.replace('.','_') + fileString;
    const directory = '/shared/' + file;
    const user = window.location.href.split('user=')[1].split('&id=')[0];
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    let fileParams = {
        fileName: directory, 
        decrypt: false, 
        options
    }
    let sharedFile = await fetchData(fileParams);
    console.log(sharedFile);
  }