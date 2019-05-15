import axios from 'axios';
import { getGlobal } from 'reactn';
import { ToastsStore} from 'react-toasts';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { loadData } from '../../shared/helpers/accountContext';
const environment = window.location.origin;
const blockstack = require('blockstack');

export function deleteTeamFile(data) {
    const { userSession, proOrgInfo } = getGlobal();

    const privateKey = userSession.loadUserData().appPrivateKey;
    const pubKey = getPublicKeyFromPrivate(privateKey);

    let serverUrl;
    const tokenData = {
        profile: userSession.loadUserData().profile, 
        username: userSession.loadUserData().username, 
        pubKey
    }
    const bearer = blockstack.signProfileToken(tokenData, userSession.loadUserData().appPrivateKey);

    environment.includes('local') ? serverUrl = 'http://localhost:5000' : serverUrl = 'https://socket.graphitedocs.com';
    const headerObj = {
        headers: {
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json', 
            'Authorization': bearer
        }, 
    }
    axios.delete(`${serverUrl}/account/organization/${proOrgInfo.orgId}/teams/${data.teamId}/files/${data.docId}?pubKey=${pubKey}`, headerObj)
        .then(async (res) => {
            console.log(res.data)
            if(res.data.success === false) {
                ToastsStore.error(res.data.message);
            } else {
                await loadData();
                ToastsStore.success(`File removed`);
            }
        }).catch((error) => {
            console.log(error);
            ToastsStore.error(`Trouble removing file`);
        })
}