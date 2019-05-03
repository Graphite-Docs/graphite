import { getGlobal } from 'reactn';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import axios from 'axios';
const jwt = require('jsonwebtoken');
const blockstack = require('blockstack');
const environment = window.location.origin;

export async function generateInviteJWT(userData) {
    const { proOrgInfo } = getGlobal();
    const token = await jwt.sign(userData.teamKeys, proOrgInfo.orgId);
    //const decoded = jwt.verify(token, proOrgInfo.orgId);
    sendInviteEmail(userData, token);
}

export async function sendInviteEmail(userData, token) {

    const { userSession } = getGlobal();
    let serverUrl;
    const privateKey = userSession.loadUserData().appPrivateKey;
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
    const inviteUrlBase = window.location.href.includes('local') ? "http://localhost:3000" : "https://app.graphitedocs.com";
    userData["pubKey"] = getPublicKeyFromPrivate(privateKey);
    const data = {
        inviteUrl: `${inviteUrlBase}/invite/${token}`, 
        userData
    }
    axios.post(`${serverUrl}/emails/invite`, JSON.stringify(data), headerObj)
        .then(async (res) => {
            console.log(res.data)
        }).catch((error) => {
            console.log(error)
        })
}

