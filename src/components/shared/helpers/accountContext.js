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

    const formsParams = {
        fileName: "forms.json",
        decrypt: true
    }

    let forms = await fetchData(formsParams);

    setGlobal({
        documents: JSON.parse(docs) ? oldFile === true ? JSON.parse(docs).value : JSON.parse(docs) : [],
        filteredDocs: JSON.parse(docs) ? oldFile === true ? JSON.parse(docs).value : JSON.parse(docs) : [],
        contacts: JSON.parse(contacts) ? oldContactsFile === true ? JSON.parse(contacts).contacts : JSON.parse(contacts) : [],
        filteredContacts: JSON.parse(contacts) ? oldContactsFile === true ? JSON.parse(contacts).contacts : JSON.parse(contacts) : [],
        files: JSON.parse(files) || [],
        filteredFiles: JSON.parse(files) || [],
        forms: JSON.parse(forms) || [],
        filteredForms: JSON.parse(forms) || [],
        loading: false
    });

    if(getGlobal().graphitePro) {
        const teamDocs = await fetchTeamDocs();
        await setGlobal({ teamDocs });
        const teamFiles = await fetchTeamFiles();
        await setGlobal({ teamFiles });
        const teamForms = await fetchTeamForms();
        await setGlobal({ teamForms: teamForms || [] });
    }
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
        await axios.get(`/account/organization/${orgId}/documents/${team.id}?pubKey=${pubKey}`, headerObj)
        .then(async (res) => {
            if(res.data.data) {
                const docs = res.data.data;
                //Now we need to fetch the team key
                const teamKeyParams = {
                    fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${team.id}/key.json`,
                    decrypt: true,
                }
                const fetchedKeys = await fetchData(teamKeyParams);

                // const thisDoc = userSession.decryptContent(JSON.parse(res.data.data), {privateKey: privateKey});
                asyncForEach(docs, (doc) => {
                    let thisDoc = doc;
                    thisDoc.currentHostBucket = userSession.decryptContent(thisDoc.currentHostBucket, {privateKey: JSON.parse(fetchedKeys).private});
                    thisDoc.teamName = userSession.decryptContent(thisDoc.teamName, {privateKey: JSON.parse(fetchedKeys).private});
                    thisDoc.title = userSession.decryptContent(thisDoc.title, {privateKey: JSON.parse(fetchedKeys).private});

                    teamDocs.push(thisDoc);
                })
            } else {
                console.log(`No team docs found for team id ${team.id}`);
            }
        }).catch(err => console.log(err));
    }

    return teamDocs;
}

export async function fetchTeamFiles() {
    const { proOrgInfo, userSession } = getGlobal();
    const orgId = proOrgInfo.orgId;
    const teams = proOrgInfo.teams;
    let myTeams = [];
    let teamFiles = [];
    teams.map(team => {
        if(team.users.some(user => user.username === userSession.loadUserData().username)) {
            myTeams.push(team);
        }
        return myTeams;
    });

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
        await axios.get(`/account/organization/${orgId}/files/${team.id}?pubKey=${pubKey}`, headerObj)
        .then(async (res) => {
            if(res.data.data) {
                const files = res.data.data;
                //Now we need to fetch the team key
                const teamKeyParams = {
                    fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${team.id}/key.json`,
                    decrypt: true,
                }
                const fetchedKeys = await fetchData(teamKeyParams);

                // const thisDoc = userSession.decryptContent(JSON.parse(res.data.data), {privateKey: privateKey});
                asyncForEach(files, (file) => {
                    let thisFile = file;
                    thisFile.currentHostBucket = userSession.decryptContent(thisFile.currentHostBucket, {privateKey: JSON.parse(fetchedKeys).private});
                    thisFile.teamName = userSession.decryptContent(thisFile.teamName, {privateKey: JSON.parse(fetchedKeys).private});
                    thisFile.name = userSession.decryptContent(thisFile.name, {privateKey: JSON.parse(fetchedKeys).private});

                    teamFiles.push(thisFile);
                })
            } else {
                console.log(`No team files found for team id ${team.id}`);
            }
        }).catch(err => console.log(err));
    }

    return teamFiles;
}

export async function fetchTeamForms() {
    const { proOrgInfo, userSession } = getGlobal();
    const orgId = proOrgInfo.orgId;
    const teams = proOrgInfo.teams;
    let myTeams = [];
    let teamForms = [];
    teams.map(team => {
        if(team.users.some(user => user.username === userSession.loadUserData().username)) {
            myTeams.push(team);
        }
        return myTeams;
    });

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
        await axios.get(`/account/organization/${orgId}/teams/${team.id}/forms?pubKey=${pubKey}`, headerObj)
        .then(async (res) => {
            if(res.data.data) {
                const forms = res.data.data;
                //Now we need to fetch the team key
                const teamKeyParams = {
                    fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${team.id}/key.json`,
                    decrypt: true,
                }
                const fetchedKeys = await fetchData(teamKeyParams);

                // const thisDoc = userSession.decryptContent(JSON.parse(res.data.data), {privateKey: privateKey});
                asyncForEach(forms, (form) => {
                    let thisForm = form;
                    //thisForm.currentHostBucket = thisForm.currentHostBucket;//userSession.decryptContent(thisForm.currentHostBucket, {privateKey: JSON.parse(fetchedKeys).private});
                    thisForm.teamName = userSession.decryptContent(thisForm.teamName, {privateKey: JSON.parse(fetchedKeys).private});
                    thisForm.title = userSession.decryptContent(thisForm.title, {privateKey: JSON.parse(fetchedKeys).private});

                    teamForms.push(thisForm);
                })
            } else {
                console.log(`No team files found for team id ${team.id}`);
            }
        }).catch(err => console.log(err));
    }

    return teamForms;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
