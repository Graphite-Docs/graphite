import { setGlobal, getGlobal } from 'reactn';
import { makeECPrivateKey, getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
import { handleProCheck } from './account';
import axios from 'axios';
import { generateInviteJWT } from './invites';
import { fetchData } from '../../shared/helpers/fetch';
const blockstack = require('blockstack');
const uuid = require('uuidv4');
const environment = window.location.origin;

export async function fetchTeamKey() {
    const { userSession } = getGlobal();
    const teamKeyParams = {
        fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${getGlobal().selectedTeam}/key.json`,
        decrypt: true
    }
    const teamKeyFile = await fetchData(teamKeyParams);
    setGlobal({ teamKeys: JSON.parse(teamKeyFile) });
}

export function handleTeamName(e) {
    setGlobal({ newTeamName: e.target.value})
}

export async function saveNewTeam() {
    const { userSession, proOrgInfo } = getGlobal();
    const userInfo = proOrgInfo.users.filter(user => user.username === userSession.loadUserData().username)[0];
    const checkRole = userInfo.role;
    const teamId = uuid();
    const privateKey = makeECPrivateKey();
    const publicKey = getPublicKeyFromPrivate(privateKey);
    const teamObj = {
        orgId: getGlobal().proOrgInfo.orgId,
        pubKey: getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey),
        team: {
            name: getGlobal().newTeamName,
            id: teamId,
            pubKey: publicKey, 
            users: [
                {
                    id: userInfo.userId,
                    username: userSession.loadUserData().username,
                    role: checkRole === "Admin" ? "Admin" : "Manager",
                    email: userInfo.email, 
                    name: userInfo.name
                }
            ]
        }
    }

    const teamKey = {
        private: privateKey,
        public: publicKey
    }

    const teamKeyParams = {
        fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${teamObj.team.id}/key.json`,
        encrypt: true, 
        body: JSON.stringify(teamKey)
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

export async function saveNewTeammate(data) {
    const { userSession, proOrgInfo, teamKeys } = getGlobal();
    const userId = uuid();
    const userObj = {
        id: userId,
        username: null,
        role: data.role,
        email: data.email, 
        name: data.name, 
        invitePending: true
    }

    const orgInfo = proOrgInfo;
    const index = await orgInfo.teams.map((x) => {return x.id }).indexOf(data.selectedTeam);

    orgInfo.teams[index].users.push(userObj);
    const updatedUserObj = userObj;
    delete updatedUserObj.invitePending;
    orgInfo.users.push(updatedUserObj);
    await setGlobal({ proOrgInfo: orgInfo });
    const accountParams = {
        fileName: "account.json", 
        encrypt: true, 
        body: JSON.stringify(getGlobal(proOrgInfo))
    }
    const updatedAccount = await postData(accountParams);
    console.log(updatedAccount);
    const privateKey = userSession.loadUserData().appPrivateKey;
    userObj["selectedTeam"] = data.selectedTeam;
    userObj["pubKey"] = getPublicKeyFromPrivate(privateKey);
    userObj["orgId"] = proOrgInfo.orgId;
    let serverUrl;
    const jwtData = {
        profile: userSession.loadUserData().profile, 
        username: userSession.loadUserData().username, 
        pubKey: getPublicKeyFromPrivate(privateKey)
    }
    const bearer = blockstack.signProfileToken(jwtData, userSession.loadUserData().appPrivateKey);
    
    environment.includes('local') ? serverUrl = 'http://localhost:5000' : serverUrl = 'https://socket.graphitedocs.com';
    const headerObj = {
        headers: {
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json', 
            'Authorization': bearer
        }, 
    }
    axios.post(`${serverUrl}/account/user?updateTeam=${true}`, JSON.stringify(userObj), headerObj)
        .then(async (res) => {
            console.log(res.data)
            if(res.data.success === false) {
                ToastsStore.error("Trouble adding new user");
            } else {
                handleProCheck();
                setGlobal({ newTeamMateModalOpen: false })
                ToastsStore.success("New user added!");
                updatedUserObj["teamKeys"] = teamKeys;
                updatedUserObj["orgName"] = proOrgInfo.orgName;
                generateInviteJWT(updatedUserObj);
            }
        }).catch((error) => {
            console.log(error)
            ToastsStore.error(`Trouble adding new user`);
        })
}