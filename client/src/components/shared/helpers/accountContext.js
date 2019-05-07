import { setGlobal, getGlobal } from 'reactn';
import { fetchData } from "./fetch";
import { getPublicKeyFromPrivate } from 'blockstack';
import { postData } from './post';
import axios from 'axios';
const blockstack = require('blockstack');

export async function loadData(params) {
    if(params) {
        setGlobal({ loading: false })
    } else {
        setGlobal({ loading: true })
    }
    
    const docsParams = {
        fileName: 'documentscollection.json', 
        decrypt: true
    }
    const contactsParams = {
        fileName: 'contact.json', 
        decrypt: true
    }
    const filesParams = {
        fileName: 'uploads.json',
        decrypt: true
    }

    const keyParams = {
        fileName: "key.json", 
        decrypt: false
    }
    // const formsParams = {

    // }
    let key = await fetchData(keyParams);
    if(key) {
        //Nothing
    } else {
        saveKey();
    }
    let docs = await fetchData(docsParams);
    let oldFile;
    let isArr = Object.prototype.toString.call(JSON.parse(docs)) === '[object Array]';
    //older versions of the doc collection stored the entire state object at the time. Need to check for that
    if(isArr === true) {
        oldFile = false
    } else {
        oldFile = true;
    }

    let contacts = await fetchData(contactsParams);
    let oldContactsFile;
    let isContactsArr = Object.prototype.toString.call(JSON.parse(contacts)) === '[object Array]';
    //older versions of the contacts collection stored the entire state object at the time. Need to check for that
    if(isContactsArr === true) {
        oldContactsFile = false
    } else {
        oldContactsFile = true;
    }
    
    let files = await fetchData(filesParams);
    setGlobal({
        documents: JSON.parse(docs) ? oldFile === true ? JSON.parse(docs).value : JSON.parse(docs) : [], 
        filteredDocs: JSON.parse(docs) ? oldFile === true ? JSON.parse(docs).value : JSON.parse(docs) : [],
        contacts: JSON.parse(contacts) ? oldContactsFile === true ? JSON.parse(contacts).contacts : JSON.parse(contacts) : [],
        filteredContacts: JSON.parse(contacts) ? oldContactsFile === true ? JSON.parse(contacts).contacts : JSON.parse(contacts) : [],
        files: JSON.parse(files) || [],
        filteredFiles: JSON.parse(files) || [],
        loading: false
    });

    if(getGlobal().graphitePro) {
        const teamDocs = await fetchTeamDocs();
        console.log(teamDocs);
        setGlobal({ teamDocs });
    }

    
    
    // await fetchData(formsParams);
}

export async function saveKey() {
    const { userSession } = getGlobal();
    const pubKey = getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey);
    const keyParams = {
        fileName: "key.json", 
        encrypt: false, 
        body: JSON.stringify(pubKey)
    }
    const postedKey = await postData(keyParams);
    console.log(postedKey);
}

export async function fetchTeamDocs() {
    const { proOrgInfo, userSession } = getGlobal();
    const orgId = proOrgInfo.orgId;
    const teams = proOrgInfo.teams;
    let myTeams = [];
    let teamDocs = [];
    teams.map(team => {
        if(team.users.some(user => user.username === userSession.loadUserData().username)) {
            myTeams.push(team);
        }
        return myTeams;
    });

    const baseUrl = window.location.href.includes('local') ? 'http://localhost:5000' : 'https://socket.graphitedocs.com';
    const data = {
        profile: userSession.loadUserData().profile, 
        username: userSession.loadUserData().username
    }
    const pubKey = getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey);
    const bearer = blockstack.signProfileToken(data, userSession.loadUserData().appPrivateKey);
    const headerObj = {
        headers: {
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json', 
            'Authorization': bearer
        }, 
    }

    for(const team of myTeams) {
        await axios.get(`${baseUrl}/account/organization/${orgId}/documents/${team.id}?pubKey=${pubKey}`, headerObj)
        .then(async (res) => {
            if(res.data.data) {
                console.log(res.data.data);
                teamDocs.push(res.data.data);
            } else {
                console.log(`No team docs found for team id ${team.id}`);
            }
        }).catch(err => console.log(err));
    }

    return teamDocs;
}