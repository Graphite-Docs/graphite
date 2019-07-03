import {setGlobal, getGlobal} from 'reactn';
import { Value } from 'slate';
import { fetchData } from "../../shared/helpers/fetch";
import { postData } from "../../shared/helpers/post";
import update from 'immutability-helper';
import { loadData } from '../../shared/helpers/accountContext';
import { singleDocModel } from '../models/singleDocModel';
import { documentModel } from '../models/documentModel';
import { savePublic } from './shareDoc';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { serializer } from './deserializer';
import { ToastsStore} from 'react-toasts';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import axios from 'axios';
const wordCount = require('html-word-count');
const initialTimeline = require('../views/editors/initialTimeline.json');
const uuid = require('uuidv4');
const lzjs = require('lzjs');
const environment = window.location.origin;
const blockstack = require('blockstack');

var timer = null;
var versionTimer = null
export async function handleChange(change) {
    await setGlobal({
      content: change.value
    });
    let updates = {
      content: getGlobal().content
    }
    clearTimeout(timer); 
    clearTimeout(versionTimer);
    timer = setTimeout(() => saveDoc(updates), 3000);
    versionTimer = setTimeout(updateVersions, 6000);
}

export async function saveDoc(updates) {
    setGlobal({ autoSave: "Saving" })
    let singleDoc = await singleDocModel(updates);
    setGlobal({ singleDoc: singleDoc });

    let filePath;
    if(window.location.href.includes('new')) {
      filePath = window.location.href.split('new/')[1];
    } else if(window.location.href.includes('team')) {
      filePath = window.location.href.split('team/')[1].split('/')[1];
    } else {
      filePath = window.location.href.split('documents/')[1];
    }
    let file = `/documents/${filePath}.json`;
    let docParams = {
        fileName: file, 
        body: JSON.stringify(getGlobal().singleDoc), 
        encrypt: true
    }
    const updatedDoc = await postData(docParams);
    console.log(updatedDoc);
    
    //Now we update the index file;
    let docs = await getGlobal().documents;
    let index = await docs.map((x) => {return x.id }).indexOf(filePath);
    let docObject = await documentModel();
    if(index < 0 && window.location.href.includes("new")) {
      await setGlobal({ documents: [...getGlobal().documents, docObject], filteredDocs: [...getGlobal().documents, docObject]});
    } else if(index > -1) {
      const updatedDocs = update(getGlobal().documents, {$splice: [[index, 1, docObject]]});
      await setGlobal({documents: updatedDocs, filteredDocs: updatedDocs});
    } else {
      console.log("Error doc index")
      console.log("Checking if this is a shared doc...")
      if(window.location.href.includes("docInfo")) {
        console.log("Shared doc.")
      } else {
        console.log("Not a shared doc.")
      }
    }
    
    let indexParams = {
      fileName: 'documentscollection.json', 
      body: JSON.stringify(getGlobal().documents), 
      encrypt: true
    }
    const updatedIndex = await postData(indexParams);
    console.log(updatedIndex);
    loadData({refresh: false});
    setGlobal({ autoSave: "Saved" });

    if(singleDoc.singleDocIsPublic) {
      const object = {};
      object.title = getGlobal().title;
      if (singleDoc.readOnly) {
        object.content = document.getElementById("editor-section").innerHTML;
      } else {
        let content = getGlobal().content;
        object.content = content.toJSON();
      }
      object.readOnly = singleDoc.readOnly;
      object.words = wordCount(
        document
          .getElementById("editor-section")
          .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
      );
      object.shared = getMonthDayYear();
      object.singleDocIsPublic = true;
      setGlobal({ singlePublic: object})
      savePublic(false);
    }

    if(window.location.href.includes('team')) {
      const data = {
        fromSave: true, 
        teamName: "", //Will need to think through how best to pass this through
        teamId: window.location.href.split('team/')[1].split('/')[0]
      }
      shareWithTeam(data);
    } else if(singleDoc.teams) {
      for (const team of singleDoc.teams) {
        const data = {
          fromSave: true, 
          teamId: team.teamId, 
          teamName: team.teamName
        }
        shareWithTeam(data);
      }
    }
}

export async function handleTitle(e) {
  let title = e.target.value;
  let updates = {
    title: title
  }
  setGlobal({ title });
  clearTimeout(timer); 
  timer = setTimeout(() => saveDoc(updates), 1500);
}

export async function loadSingle() {
  const { userSession } = getGlobal();
  setGlobal({loading: true});
  if(window.location.href.includes('team')) {
    //First we need to get the team key for decryption
    const teamId = window.location.href.split('team/')[1].split('/')[0];
    const fileId = window.location.href.split('team/')[1].split('/')[1];
    const teamKeyParams = {
      fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${teamId}/key.json`,
      decrypt: true,
    }
    const fetchedKeys = await fetchData(teamKeyParams);
    //then we need to know who to fetch the file from
    const teamDocs = getGlobal().teamDocs;
    if(teamDocs.length > 0) {
      //On refresh, team docs won't be loaded right away, so need to check for them.
      const index = await teamDocs.map((x) => {return x.id }).indexOf(fileId);
      const thisDoc = teamDocs[index];
      const userHub = thisDoc.currentHostBucket;
      const teamDoc = {
        fileName: `teamDocs/${teamId}/${fileId}.json`,
        options: { username: userHub, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
      }
      const encryptedDoc = await fetchData(teamDoc);
      const decryptedDoc = userSession.decryptContent(JSON.parse(encryptedDoc), {privateKey: JSON.parse(fetchedKeys).private});
      setGlobal({
        singleDoc: JSON.parse(decryptedDoc), 
        title: JSON.parse(decryptedDoc).title,
        content: Value.fromJSON(JSON.parse(decryptedDoc).content),
        loading: false, 
        myTimeline: JSON.parse(decryptedDoc).myTimeline || initialTimeline
      })
    } else {
        await setTimeout(async () => {
          const teamDocs = await getGlobal().teamDocs;
          const index = await teamDocs.map((x) => {return x.id }).indexOf(fileId);
          const thisDoc = teamDocs[index];
          const userHub = thisDoc.currentHostBucket;
          const teamDoc = {
            fileName: `teamDocs/${teamId}/${fileId}.json`,
            options: { username: userHub, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
          }
          const encryptedDoc = await fetchData(teamDoc);
          const decryptedDoc = userSession.decryptContent(JSON.parse(encryptedDoc), {privateKey: JSON.parse(fetchedKeys).private});
          setGlobal({
            singleDoc: JSON.parse(decryptedDoc), 
            title: JSON.parse(decryptedDoc).title,
            content: Value.fromJSON(JSON.parse(decryptedDoc).content),
            loading: false, 
            myTimeline: JSON.parse(decryptedDoc).myTimeline || initialTimeline
          })
        }, 3000);
    }
  } else {
    const file = `/documents/${window.location.href.split('documents/')[1]}.json`;
    const docParams = {
      fileName: file,
      decrypt: true
    }

    let doc = await fetchData(docParams);
    let parsedDoc = JSON.parse(doc);
    let compressed = parsedDoc.compressed;
    let updatedContent;
    if(compressed === true) {
      console.log("compressed")
      updatedContent = serializer.deserialize(lzjs.decompress(parsedDoc.content));
    } 
    setGlobal({
      singleDoc: parsedDoc, 
      title: JSON.parse(doc).title,
      content: compressed ? Value.fromJSON(updatedContent) : Value.fromJSON(parsedDoc.content),
      loading: false, 
      myTimeline: JSON.parse(doc).myTimeline || initialTimeline
    })
  }
}

export async function updateVersions() {
  let singleDoc = await getGlobal().singleDoc;
  let content = await getGlobal().content;
  singleDoc["content"] = content;
  const newVersionId = uuid();
  let file = `documents/versions/${newVersionId}.json`;
    let versionParams = {
        fileName: file, 
        body: JSON.stringify(singleDoc), 
        encrypt: true
    }
    const newVersion = await postData(versionParams);
    console.log(newVersion);
    const versionData = {
      version: newVersionId,
      timestamp: Date.now()
    }
    saveDoc({version: versionData})
}

export async function loadVersion(id) {
  const file = `documents/versions/${id}.json`
  const docParams = {
    fileName: file,
    decrypt: true
  }

  let doc = await fetchData(docParams);
  console.log(JSON.parse(doc))
  setGlobal({
    singleDoc: JSON.parse(doc), 
    title: JSON.parse(doc).title,
    content: Value.fromJSON(JSON.parse(doc).content),
    myTimeline: JSON.parse(doc).myTimeline || initialTimeline
  })
}

export async function shareWithTeam(data) {
  if(data.fromSave) {
    //Nothing
  } else {
    setGlobal({ teamShare: true });
  }
  const { userSession, proOrgInfo } = getGlobal();
  let fileId;
  if(window.location.href.includes("new")) {
    fileId = window.location.href.split('new/')[1];
  } else if(window.location.href.includes('team')) {
    fileId = window.location.href.split('team/')[1].split('/')[1];
  } else {
    fileId = window.location.href.split('documents/')[1];
  }
  //First we need to fetch the teamKey
  const teamKeyParams = {
    fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${data.teamId}/key.json`,
    decrypt: true
  }
  const fetchedKeys = await fetchData(teamKeyParams);

  const document = {
    id: fileId,
    team: data.teamId, 
    orgId: proOrgInfo.orgId,
    title: getGlobal().title,
    content: getGlobal().content, 
    currentHostBucket: userSession.loadUserData().username
  }
  const encryptedTeamDoc = userSession.encryptContent(JSON.stringify(document), {publicKey: JSON.parse(fetchedKeys).public})
 
  const teamDoc = {
    fileName: `teamDocs/${data.teamId}/${fileId}.json`, 
    encrypt: false,
    body: JSON.stringify(encryptedTeamDoc)
  }
  const postedTeamDoc = await postData(teamDoc);
  console.log(postedTeamDoc);

  let singleDoc = getGlobal().singleDoc;
  singleDoc["teamDoc"] = true;
  await setGlobal({ singleDoc });
  if(data.fromSave) {
    //Do nothing
  } else {
    await saveDoc({teamDoc: true});
  }

  const privateKey = userSession.loadUserData().appPrivateKey;

  const syncedDoc = {
    id: fileId,
    title: userSession.encryptContent(getGlobal().title, {publicKey: JSON.parse(fetchedKeys).public}), 
    teamName: userSession.encryptContent(data.teamName, {publicKey: JSON.parse(fetchedKeys).public}),
    orgId: proOrgInfo.orgId,
    teamId: data.teamId,
    lastUpdated: getMonthDayYear(),
    timestamp: Date.now(), 
    currentHostBucket: userSession.encryptContent(userSession.loadUserData().username, {publicKey: JSON.parse(fetchedKeys).public}),
    pubKey: getPublicKeyFromPrivate(privateKey)
  }
  
  let serverUrl;
    const tokenData = {
        profile: userSession.loadUserData().profile, 
        username: userSession.loadUserData().username, 
        pubKey: getPublicKeyFromPrivate(privateKey)
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
    axios.post(`${serverUrl}/account/organization/${proOrgInfo.orgId}/documents`, JSON.stringify(syncedDoc), headerObj)
        .then(async (res) => {
            console.log(res.data)
            if(res.data.success === false) {
                ToastsStore.error(res.data.message);
            } else {
              setGlobal({ teamShare: false, teamListModalOpen: false });
              if(data.initialShare === true) {
                ToastsStore.success(`Document shared with team: ${data.teamName}`);
              }
            }
        }).catch((error) => {
            console.log(error);
            if(data.initialShare === true) {
              ToastsStore.error(`Trouble sharing document`);
            }
        })
}