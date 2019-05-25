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
var timer = null;

export async function loadForm(id) {
    let fetchedKeys;
    const { userSession } = getGlobal();
    let teamForm = window.location.href.includes('team') ? true : false;
    setGlobal({ formLoading: true });
    if(teamForm) {
        const teamId = window.location.href.split('team/')[1].split('/')[0];
        //Need to load the team form info first, then we can figure out which bucket to load from.
        //Fetch teamKeys
        const teamKeyParams = {
            fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${teamId}/key.json`,
            decrypt: true,
        }
        fetchedKeys = await fetchData(teamKeyParams);
        console.log(fetchedKeys);
        setGlobal({ teamKeys: fetchedKeys });
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

        axios.get(`${baseUrl}/public/organization/${getGlobal().proOrgInfo.orgId}/forms/${id}?pubKey=${pubKey}`, headerObj)
            .then(async (res) => {
                
                if(res.data.data) {
                    const host = res.data.data.currentHostBucket;
                    const options = { username: host, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
                    let params = {
                        fileName: `forms/${id}.json`, 
                        options
                    }
                
                    let teamForm = await fetchData(params);
                    let decryptedForm = JSON.parse(userSession.decryptContent(teamForm, {privateKey: JSON.parse(fetchedKeys).private}));
                    
                    await setGlobal({ singleForm: decryptedForm, formLoading: false });
                    //finally we need to fetch the responses
                    axios.get(`${baseUrl}/account/organization/${getGlobal().proOrgInfo.orgId}/forms/${id}?pubKey=${pubKey}`, headerObj)
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
                    console.log(`creating form`);
                    postNewForm(id, fetchedKeys);
                }
            }).catch(err => console.log(err));
    } else {
        const formParams = {
            fileName: `forms/${id}.json`, 
            decrypt: true
        }
        const form = await fetchData(formParams);
        if(JSON.parse(form)) {
            await setGlobal({ singleForm: JSON.parse(form), formLoading: false});
            
            if(teamForm) {
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
                axios.get(`${baseUrl}/public/organization/${getGlobal().proOrgInfo.orgId}/forms/${id}?pubKey=${pubKey}`, headerObj)
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
                axios.get(`${baseUrl}/public/forms/${id}/user/${userSession.loadUserData().username}?pubKey=${pubKey}`, headerObj)
                .then(async (res) => {
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
            }
        } else {
            postNewForm(id, getGlobal().teamKeys);
        }
    }
}

export async function postNewForm(id, fetchedKeys) {
    console.log(fetchedKeys);

    let teamForm = window.location.href.includes('team') ? true : false;
    const { userSession } = getGlobal();
    if(window.location.href.includes('new')) {
        let teamId;
        let teamName = getGlobal().teamName;
        if(teamForm) {
            teamId = window.location.href.split('team/')[1].split('/')[0];
        }
        
        setGlobal({ formLoading: false });
        //Need to create the form since it doesn't exist yet
        const formObject = {
            id: id,
            tags: [],
            title: "Untitled",
            created: getMonthDayYear(),
            lastUpdated: Date.now(),
            questions: [], 
            teamForm: teamForm ? true : false,
            teamName: teamForm ? getGlobal().teamName : "",
            teamId: teamForm ? getGlobal().teamId : "",
            teams: [], 
            responses: []
        }
        setGlobal({ singleForm: formObject });
        if(teamForm) {
            //Don't add to index
            const encryptedFormObject = userSession.encryptContent(JSON.stringify(formObject), {publicKey: JSON.parse(fetchedKeys).public})
            const newFormParams = {
                fileName: `forms/${formObject.id}.json`, 
                encrypt: false, 
                body: encryptedFormObject
            }
            const newForm = await postData(newFormParams);
            console.log(newForm);
            const data = {
                fromSave: true, 
                teamId: teamId, 
                teamName: teamName, 
                initialShare: true
            }
            shareWithTeam(data);
        } else {
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
        }
    } else {
        console.log("Error loading form");
        setGlobal({ singleForm: {}, formLoading: false })
    }
}

export async function saveForm(teamShare) {
    const { userSession } = getGlobal();
    const proOrgInfo = getGlobal().proOrgInfo;
    const teamForm = window.location.href.includes('team') ? true : false;
    let singleForm = getGlobal().singleForm;
    const formObject = {
        id: singleForm.id,
        tags: singleForm.tags,
        title: singleForm.title,
        created: singleForm.created,
        lastUpdated: Date.now(),
        questions: singleForm.questions, 
        teamForm: singleForm.teamForm, 
        teams: singleForm.teams, 
        teamName: singleForm.teamName || "",
        teamId: singleForm.teamId || "", 
        responses: singleForm.responses || []
    }
    await setGlobal({ singleForm: formObject });
    let newFormParams;
    if(teamForm) {
        const encryptedTeamForm = userSession.encryptContent(JSON.stringify(formObject), {publicKey: JSON.parse(getGlobal().teamKeys).public});
        const teamId = window.location.href.split('team/')[1].split('/')[0];
        const teams = proOrgInfo.teams;
        const thisTeam = teams.filter(a => a.id === teamId)[0];

        newFormParams = {
            fileName: `forms/${formObject.id}.json`, 
            encrypt: false, 
            body: encryptedTeamForm
        }
        const data = {
            fromSave: true, 
            teamName: thisTeam.name,
            teamId: teamId
          }
          shareWithTeam(data);
    } else {
        newFormParams = {
            fileName: `forms/${formObject.id}.json`, 
            encrypt: true, 
            body: JSON.stringify(formObject)
        }
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
        } else {
            console.log("Error form index");
            ToastsStore.error(`Trouble saving form`);
        }
    }

    const newForm = await postData(newFormParams);
    
    ToastsStore.success(`Form saved`);
    console.log(newForm);
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
    const teamForm = window.location.href.includes('team') ? true : false;
    let singleForm = getGlobal().singleForm;
    let proOrgInfo = getGlobal().proOrgInfo;
    let userSession = getGlobal().userSession;

    const formObject = {
        id: singleForm.id,
        tags: singleForm.tags,
        title: singleForm.title,
        created: singleForm.created,
        lastUpdated: Date.now(),
        questions: singleForm.questions, 
        teamForm: singleForm.teamForm,
        teams: singleForm.teams, 
        responses: getGlobal().formResponses
    }
    console.log(formObject);
    setGlobal({ singleForm: formObject });
    const newFormParams = {
        fileName: `public/forms/${formObject.id}.json`, 
        encrypt: false, 
        body: JSON.stringify(formObject)
    }
    const newPublicForm = await postData(newFormParams);
    console.log(newPublicForm);
    if(teamForm) {
        const teamId = window.location.href.split('team/')[1].split('/')[0];
        const teams = proOrgInfo.teams;
        const thisTeam = teams.filter(a => a.id === teamId)[0];
        const teamInfo = {
            teamId: teamId,
            teamName: thisTeam.name
        }
        shareWithTeam(teamInfo);
    }
   
    if(type === 'link') {
        setGlobal({ formLinkModalOpen: true })
    } else {
        let singleForm = getGlobal().singleForm;
        if(singleForm.teamForm) {
            setGlobal({ formEmbedModalOpen: true, embed: `<iframe \nsrc="${window.location.origin}/public/forms/${proOrgInfo.orgId}/${singleForm.id}" \ntitle="${singleForm.title}" \nstyle="position: absolute; height: 100%; max-width: 100%; margin: auto; border: none">\n</iframe>` });
        } else {
            setGlobal({ formEmbedModalOpen: true, embed: `<iframe \nsrc="${window.location.origin}/single/forms/${proOrgInfo.orgId}/${singleForm.id}/${userSession.loadUserData().username}" \ntitle="${singleForm.title}" \nstyle="position: absolute; height: 100%; max-width: 100%; margin: auto; border: none">\n</iframe>` });
        }
    }
}

export async function shareWithTeam(data) {
    console.log(data);
    if(data.fromSave) {
      //Nothing
    } else {
      setGlobal({ teamShare: true });
    }
    const { userSession, proOrgInfo } = getGlobal();
    //First we need to fetch the teamKey
    const teamKeyParams = {
      fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${data.teamId}/key.json`,
      decrypt: true
    }
    const fetchedKeys = await fetchData(teamKeyParams);
    let singleForm = getGlobal().singleForm;
    const form = {
      id: singleForm.id,
      team: data.teamId, 
      orgId: proOrgInfo.orgId,
      title: singleForm.title,
      responses: singleForm.responses || getGlobal().formResponses,
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
      responses: singleForm.responses || getGlobal().formResponses,
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
                  ToastsStore.success(`Team form created for team: ${data.teamName}`);
                }
              }
          }).catch((error) => {
              console.log(error);
              if(data.initialShare === true) {
                ToastsStore.error(`Trouble creating form`);
              }
          })
  }