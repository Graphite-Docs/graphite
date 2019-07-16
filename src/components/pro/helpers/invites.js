import { getGlobal } from 'reactn';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import axios from 'axios';
import { fetchData } from '../../shared/helpers/fetch';
import { ToastsStore} from 'react-toasts';
import { handleProCheck } from '../helpers/account';
import { postData } from '../../shared/helpers/post';
const jwt = require('jsonwebtoken');
const blockstack = require('blockstack');

export async function generateInviteJWT(userData) {
    const { proOrgInfo } = getGlobal();
    const token = await jwt.sign(userData, proOrgInfo.orgId);
    //const decoded = jwt.verify(token, proOrgInfo.orgId);
    sendInviteEmail(userData, token);
}

export async function sendInviteEmail(userData, token) {

    const { userSession } = getGlobal();
    const privateKey = userSession.loadUserData().appPrivateKey;
    const jwtData = {
        profile: userSession.loadUserData().profile,
        username: userSession.loadUserData().username,
        pubKey: getPublicKeyFromPrivate(privateKey)
    }
    const bearer = blockstack.signProfileToken(jwtData, userSession.loadUserData().appPrivateKey);
    const headerObj = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Authorization': bearer
        },
    }
    const inviteUrlBase = window.location.href.includes('local') ? "http://localhost:3000" : "https://app.graphitedocs.com";
    userData["pubKey"] = getPublicKeyFromPrivate(privateKey);
    const data = {
        inviteUrl: `${inviteUrlBase}/invite/${token}`,
        userData
    }
    axios.post(`/emails/invite`, JSON.stringify(data), headerObj)
        .then(async (res) => {
            console.log(res.data)
            if(userData.resend) {
                ToastsStore.success("Invite email re-sent!");
            }
        }).catch((error) => {
            ToastsStore.error("Trouble re-sending invite email.");
            console.log(error)
        })
}

export async function resendInvite(user, team) {
    ToastsStore.success("Re-sending invite email...");
    const { userSession, proOrgInfo } = getGlobal();
    const privateKey = userSession.loadUserData().appPrivateKey;
    const teamKeyParams = {
        fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${team}/key.json`,
        decrypt: true,
    }
    const fetchedKeys = await fetchData(teamKeyParams);
    const teamKeys = JSON.parse(fetchedKeys);
    const dataObj = {
        id: user.id,
        username: null,
        role: user.role,
        email: user.email,
        name: user.name,
        invitePending: true,
        orgId: proOrgInfo.orgId,
        selectedTeam: team,
        orgName: proOrgInfo.orgName,
        teamKeys,
        pubKey: getPublicKeyFromPrivate(privateKey),
        resend: true
    }
    generateInviteJWT(dataObj);
}

export function acceptInvite(e) {
    const origin = window.location.origin;
    e.preventDefault();
    blockstack.redirectToSignIn(`${origin}/invite/accept`, origin + '/manifest.json', ['store_write', 'publish_data', 'email'])
}

export function saveToken() {
    const token = window.location.href.split('invite/')[1];
    localStorage.setItem('inviteToken', token);
}

export async function decodeToken() {
    const { userSession } = getGlobal();
    console.log("decoding...")
    const token = localStorage.getItem('inviteToken');
    const decoded = jwt.decode(token);
    console.log(decoded);
    const accountObject = {
        orgId: decoded.orgId,
        id: decoded.id,
        name: decoded.name,
        organization: decoded.orgName,
        email: decoded.email,
        role: decoded.role,
        username: getGlobal().userSession.loadUserData().username,
        selectedTeam: decoded.selectedTeam,
        pubKey: blockstack.getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey),
    }

    const accountParams = {
        fileName: "account.json",
        encrypt: true,
        body: JSON.stringify(accountObject)
    }

    const postAccount = await postData(accountParams);
    console.log(postAccount);

    const teamKeyParams = {
        fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${decoded.selectedTeam}/key.json`,
        encrypt: true,
        body: JSON.stringify(decoded.teamKeys)
    }
    const postedKeys = await postData(teamKeyParams);
    console.log(postedKeys);

    updateUserInfo(decoded);
}

export async function updateUserInfo(tokenData) {
    const { userSession } = getGlobal();
    const dataObj = tokenData;
    dataObj["username"] = userSession.loadUserData().username;
    const privateKey = userSession.loadUserData().appPrivateKey;
    dataObj["pubKey"] = getPublicKeyFromPrivate(privateKey);

    const jwtData = {
        profile: userSession.loadUserData().profile,
        username: userSession.loadUserData().username,
        pubKey: getPublicKeyFromPrivate(privateKey)
    }
    const bearer = blockstack.signProfileToken(jwtData, userSession.loadUserData().appPrivateKey);
    const headerObj = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Authorization': bearer
        },
    }
    axios.put(`/account/organization/${dataObj.orgId}/user/${dataObj.id}`, JSON.stringify(dataObj), headerObj)
        .then(async (res) => {
            console.log(res.data)
            if(res.data.success === false) {
                ToastsStore.error("Trouble updating your account");
            } else {
                handleProCheck();
                ToastsStore.success("Invite accepted!");
                localStorage.removeItem('inviteToken');
                window.location.replace('/walkthrough');
            }
        }).catch((error) => {
            console.log(error)
            ToastsStore.error(`Trouble updating your account`);
        })
}
