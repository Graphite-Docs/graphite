import axios from 'axios';
import {setGlobal, getGlobal} from 'reactn';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { ToastsStore} from 'react-toasts';
const uuid = require('uuidv4');
const blockstack = require('blockstack');
let host;

export async function loadPublicForm() {
    //console.log("loading...")
    if(window.location.href.includes('single')) {
        //console.log("single form");
        host = window.location.href.split('forms/')[1].split('/')[2];
        loadFromHost(host);
    } else {
        //console.log("team form");
        const formId = window.location.href.split('forms/')[1].split('/')[1];
        const orgId = window.location.href.split('forms/')[1].split('/')[0];
        const headerObj = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
        }
        //console.log(formId);
        //console.log(`${baseUrl}/public/organization/${orgId}/forms/${formId}`);
        axios.get(`/public/organization/${orgId}/forms/${formId}`, headerObj)
            .then(async (res) => {
                console.log(res);
                if(res.data.data) {
                    console.log(res.data.data);
                    host = res.data.data.currentHostBucket;
                    loadFromHost(host);
                } else {
                    console.log(`Trouble loading form`);
                }
            }).catch(err => console.log(err));
    }
}

export async function loadFromHost(host) {
    //console.log(host);
    let formId;
    if(window.location.href.includes('single')) {
        formId = window.location.href.split('forms/')[1].split('/')[1];
    } else {
        formId = window.location.href.split('forms/')[1].split('/')[1];
    }
    // const options = { username: host, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    // let params = {
    //     fileName: `public/forms/${formId}.json`,
    //     options
    // }
    // let fetchedForm = await fetchData(params);
    // console.log(fetchedForm);
    // setGlobal({ publicForm: JSON.parse(fetchedForm), loading: false  });
    blockstack.lookupProfile(host, "https://core.blockstack.org/v1/names")
    .then((profile) => {
        //console.log(profile);
        //console.log(profile.apps[window.location.origin]);
        axios.get(`${profile.apps[window.location.origin]}public/forms/${formId}.json`)
        .then((response) => {
            //console.log(response);
            if(Object.keys(response.data).length > 0) {
                setGlobal({ publicForm: response.data, loading: false  });
            } else {
                console.log("error")
            }
        })
        .catch((error) => {
            console.log('error:', error);
        });
    })
    .catch((error) => {
        console.log(error);
      console.log('could not resolve profile')
})
}

export async function postForm(responses) {
    const publicForm = getGlobal().publicForm;
    if(window.location.href.includes('single')) {
        const formId = window.location.href.split('forms/')[1].split('/')[1];
        const user = window.location.href.split('forms/')[1].split('/')[2];
        const orgId = window.location.href.split('forms/')[1].split('/')[0];
        const thisResponse = {
            id: uuid(),
            responses,
            dateSubmitted: getMonthDayYear(),
            timestamp: Date.now(),
            title: publicForm.title,
            formId,
            orgId
        }
        const headerObj = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
        }
        axios.post(`/public/organization/${orgId}/forms/${formId}/user/${user}`, JSON.stringify(thisResponse), headerObj)
            .then(async (res) => {
                console.log(res.data)
                if(res.data.success === false) {
                    ToastsStore.error(`Trouble posting response`);
                } else {
                    setGlobal({ submitted: true });
                }
            }).catch((error) => {
                console.log(error);
                    ToastsStore.error(`Trouble posting response`);
            });
    } else {
        const formId = window.location.href.split('forms/')[1].split('/')[1];
        const orgId = window.location.href.split('forms/')[1].split('/')[0];
        const thisResponse = {
            id: uuid(),
            responses,
            dateSubmitted: getMonthDayYear(),
            timestamp: Date.now()
        }
        const headerObj = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
        }
        axios.post(`/public/organization/${orgId}/forms/${formId}`, JSON.stringify(thisResponse), headerObj)
            .then(async (res) => {
                console.log(res.data)
                if(res.data.success === false) {
                    ToastsStore.error(`Trouble posting response`);
                } else {
                    setGlobal({ submitted: true });
                }
            }).catch((error) => {
                console.log(error);
                    ToastsStore.error(`Trouble posting response`);
            });
    }
}
