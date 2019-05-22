import { setGlobal, getGlobal } from 'reactn';
import { fetchData } from '../../shared/helpers/fetch';
import { ToastsStore} from 'react-toasts';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { postData } from '../../shared/helpers/post';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import update from 'immutability-helper';
import axios from 'axios';
const environment = window.location.origin;
const blockstack = require('blockstack');
const uuid = require('uuidv4');
var timer = null;

export async function loadForm(id) {
    const { userSession, proOrgInfo } = getGlobal();
    setGlobal({ formLoading: true });
    const formParams = {
        fileName: `forms/${id}.json`, 
        decrypt: true
    }
    const form = await fetchData(formParams);
    if(JSON.parse(form)) {
        await setGlobal({ singleForm: JSON.parse(form), formLoading: false});
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
        axios.get(`${baseUrl}/public/organization/${proOrgInfo.orgId}/forms/${id}?pubKey=${pubKey}`, headerObj)
            .then(async (res) => {
                console.log(res);
                if(res.data.data) {
                    setGlobal({ formResponses: res.data.data});
                    // //Now we need to fetch the team key
                    // const teamKeyParams = {
                    //     fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${team.id}/key.json`,
                    //     decrypt: true,
                    // }
                    // const fetchedKeys = await fetchData(teamKeyParams);
                } else {
                    console.log(`No form responses found for form id ${id}`);
                }
            }).catch(err => console.log(err));
    } else {
        if(window.location.href.includes('new')) {
            setGlobal({ formLoading: false });
            //Need to create the form since it doesn't exist yet
            const formObject = {
                id: uuid(),
                tags: [],
                title: "Untitled",
                created: getMonthDayYear(),
                lastUpdated: Date.now(),
                questions: [], 
                teamForm: false, 
                teams: []
            }
            setGlobal({ singleForm: formObject });
            const newFormParams = {
                fileName: `forms/${formObject.id}.json`, 
                encrypt: true, 
                body: JSON.stringify(formObject)
            }
            const newForm = await postData(newFormParams);
            console.log(newForm);
            let forms = getGlobal().forms;
            forms.push(formObject);
            setGlobal({ forms, filteredForms: forms })
            const newFormIndex = {
                fileName: 'forms.json',
                encrypt: true,
                body: JSON.stringify(forms)
            }
            const newIndex = await postData(newFormIndex);
            console.log(newIndex);
        } else {
            console.log("Error loading form");
            setGlobal({ singleForm: {}, formLoading: false })
        }
    }
}

export async function saveForm(teamShare) {
    let singleForm = getGlobal().singleForm;
    const formObject = {
        id: singleForm.id,
        tags: singleForm.tags,
        title: singleForm.title,
        created: singleForm.created,
        lastUpdated: Date.now(),
        questions: singleForm.questions, 
        teamForm: singleForm.teamForm, 
        teams: singleForm.teams
    }
    setGlobal({ singleForm: formObject });
    const newFormParams = {
        fileName: `forms/${formObject.id}.json`, 
        encrypt: true, 
        body: JSON.stringify(formObject)
    }
    const newForm = await postData(newFormParams);
    console.log(newForm);
    let forms = getGlobal().forms;
    let index = await forms.map((x) => {return x.id }).indexOf(formObject.id);
    if(index > -1) {
        const updatedForms = update(getGlobal().forms, {$splice: [[index, 1, formObject]]});
        await setGlobal({forms: updatedForms, filteredForms: updatedForms });
        const newFormIndex = {
            fileName: 'forms.json',
            encrypt: true,
            body: JSON.stringify(getGlobal().forms)
        }
        const newIndex = await postData(newFormIndex);
        console.log(newIndex);
        ToastsStore.success(`Form saved`);
        if(window.location.href.includes('team')) {
            if (teamShare === false) {
                
            } else {
                const data = {
                    fromSave: true, 
                    teamName: "", //Will need to think through how best to pass this through
                    teamId: window.location.href.split('team/')[1].split('/')[0]
                  }
                  shareWithTeam(data);
            }
          } else if(singleForm.teams) {
              if(teamShare === false) {

              } else {
                for (const team of singleForm.teams) {
                    const data = {
                      fromSave: true, 
                      teamId: team, 
                      teamName: team.teamName
                    }
                    shareWithTeam(data);
                  }
              }
          }
    } else {
        console.log("Error form index");
        ToastsStore.error(`Trouble saving form`);
    }
}

export async function deleteQuestion(question) {
    let singleForm = getGlobal().singleForm;
    let questions = singleForm.questions;
    let index = await questions.map((x) => {return x.id }).indexOf(question.id);
    if(index > -1) {
        questions.splice(index, 1);
        singleForm["questios"] = questions;
        setGlobal({ singleForm });
        saveForm();
    } else {
        console.log("Error with index");
    }
}

export function handleFormTitle(e) {
    let singleForm = getGlobal().singleForm;
    let title;
    title = e.target.value;
    singleForm["title"] = title;
    setGlobal({ singleForm });
    clearTimeout(timer); 
    timer = setTimeout(() => {
        saveForm();
        setGlobal({ formTitleSaved: true });
        setTimeout(() => {
            setGlobal({ formTitleSaved: false });
        }, 1000)
    }, 1500);
}

export async function publicForm(type) {
    let singleForm = getGlobal().singleForm;
    let proOrgInfo = getGlobal().proOrgInfo;

    const formObject = {
        id: singleForm.id,
        tags: singleForm.tags,
        title: singleForm.title,
        created: singleForm.created,
        lastUpdated: Date.now(),
        questions: singleForm.questions, 
        teamForm: singleForm.teamForm,
        teams: singleForm.teams
    }
    setGlobal({ singleForm: formObject });
    const newFormParams = {
        fileName: `public/forms/${formObject.id}.json`, 
        encrypt: false, 
        body: JSON.stringify(formObject)
    }
    const newPublicForm = await postData(newFormParams);
    console.log(newPublicForm);
    if(singleForm.teams.length > 0) {
        for(const team of singleForm.teams) {
            const teamInfo = {
                teamId: team
            }
            shareWithTeam(teamInfo)
        }
    }
    if(type === 'link') {
        setGlobal({ formLinkModalOpen: true })
    } else {
        setGlobal({ formEmbedModalOpen: true, embed: `<iframe \nsrc=${window.location.origin}/public/forms/${proOrgInfo.orgId}/${singleForm.id}" \ntitle=${singleForm.title} \nstyle="position: absolute; height: 100%; max-width: 100%; margin: auto; border: none">\n</iframe>` });
    }
}

export async function shareWithTeam(data) {
    if(data.fromSave) {
      //Nothing
    } else {
      setGlobal({ teamShare: true });
    }
    const { userSession, proOrgInfo, singleForm } = getGlobal();
    //First we need to fetch the teamKey
    const teamKeyParams = {
      fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${data.teamId}/key.json`,
      decrypt: true
    }
    const fetchedKeys = await fetchData(teamKeyParams);
  
    const form = {
      id: singleForm.id,
      team: data.teamId, 
      orgId: proOrgInfo.orgId,
      title: singleForm.title,
      currentHostBucket: userSession.loadUserData().username
    }
    const encryptedTeamForm = userSession.encryptContent(JSON.stringify(form), {publicKey: JSON.parse(fetchedKeys).public})
   
    const teamForm = {
      fileName: `teamForms/${data.teamId}/${singleForm.id}.json`, 
      encrypt: false,
      body: JSON.stringify(encryptedTeamForm)
    }
    const postedTeamForm = await postData(teamForm);
    console.log(postedTeamForm);

    singleForm["teamForm"] = true;
    let theseTeams = singleForm.teams;
    singleForm.teams.includes(data.teamId) ? singleForm.teams = theseTeams : singleForm.teams.push(data.teamId);
    await setGlobal({ singleForm });
    if(data.fromSave) {
      //Do nothing
    } else {
      await saveForm(false);
    }
  
    const privateKey = userSession.loadUserData().appPrivateKey;
  
    const syncedForm = {
      id: singleForm.id,
      title: userSession.encryptContent(singleForm.title, {publicKey: JSON.parse(fetchedKeys).public}), 
      teamName: data.teamName ? userSession.encryptContent(data.teamName, {publicKey: JSON.parse(fetchedKeys).public}) : "",
      orgId: proOrgInfo.orgId,
      teamId: data.teamId,
      lastUpdated: getMonthDayYear(),
      timestamp: Date.now(), 
      currentHostBucket: userSession.loadUserData().username,
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
      axios.post(`${serverUrl}/account/organization/${proOrgInfo.orgId}/forms`, JSON.stringify(syncedForm), headerObj)
          .then(async (res) => {
              console.log(res.data)
              if(res.data.success === false) {
                  ToastsStore.error(res.data.message);
              } else {
                setGlobal({ teamShare: false, teamListModalOpen: false });
                if(data.initialShare === true) {
                  ToastsStore.success(`Form shared with team: ${data.teamName}`);
                }
              }
          }).catch((error) => {
              console.log(error);
              if(data.initialShare === true) {
                ToastsStore.error(`Trouble sharing form`);
              }
          })
  }