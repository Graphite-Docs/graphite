import { setGlobal, getGlobal } from 'reactn';
import { makeECPrivateKey, getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
import { handleProCheck } from './account';
import axios from 'axios';
const blockstack = require('blockstack');
const uuid = require('uuidv4');
const environment = window.location.origin;

export function handleTeamName(e) {
    setGlobal({ newTeamName: e.target.value})
}

export async function saveNewTeam() {
    const { userSession } = getGlobal();
    const teamId = uuid();
    const privateKey = makeECPrivateKey();
    const publicKey = getPublicKeyFromPrivate(privateKey);
    const teamObj = {
        orgId: getGlobal().proOrgInfo.orgId,
        pubKey: getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey),
        team: {
            name: getGlobal().newTeamName,
            id: teamId, 
            users: [
                {
                    username: userSession.loadUserData().username
                }
            ],
            pubKey: publicKey
        }
    }

    const teamKeyParams = {
        fileName: `team/${teamObj.team.id}/key.json`,
        encrypt: true, 
        body: JSON.stringify(teamObj)
    }
    const postedTeamKey = await postData(teamKeyParams);
    console.log(postedTeamKey);

    let serverUrl;
    const data = {
        profile: userSession.loadUserData().profile, 
        username: userSession.loadUserData().username, 
        pubKey: getPublicKeyFromPrivate(privateKey)
    }
    const bearer = blockstack.signProfileToken(data, userSession.loadUserData().appPrivateKey);
    
    environment.includes('local') ? serverUrl = 'http://localhost:5000' : serverUrl = 'https://socket.graphitedocs.com';
    const headerObj = {
        headers: {
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json', 
            'Authorization': bearer
        }, 
    }
    axios.post(`${serverUrl}/account/org/team`, JSON.stringify(teamObj), headerObj)
        .then(async (res) => {
            console.log(res.data)
            if(res.data.success === false) {
                ToastsStore.error(res.data.message);
            } else {
                handleProCheck();
                setGlobal({ newTeamName: "", newTeamModalOpen: false })
                ToastsStore.success("New team added!");
            }
        }).catch((error) => {
            console.log(error)
            ToastsStore.error(`Trouble adding new team`);
        })
}