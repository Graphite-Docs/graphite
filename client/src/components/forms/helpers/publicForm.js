import axios from 'axios';
import {setGlobal, getGlobal} from 'reactn';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { ToastsStore} from 'react-toasts';
import { fetchData } from '../../shared/helpers/fetch';
const uuid = require('uuidv4');
const environment = window.location.origin;
let host;

export async function loadPublicForm() {
    console.log("loading...")
    if(window.location.href.includes('single')) {
        host = window.location.href.split('forms/')[1].split('/')[2];
        loadFromHost(host);
    } else {
        const formId = window.location.href.split('forms/')[1].split('/')[1];
        const orgId = window.location.href.split('forms/')[1].split('/')[0];
        const baseUrl = window.location.href.includes('local') ? 'http://localhost:5000' : 'https://socket.graphitedocs.com';
        const headerObj = {
            headers: {
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json'
            }, 
        }
        console.log(formId);
        axios.get(`${baseUrl}/public/organization/${orgId}/forms/${formId}`, headerObj)
            .then(async (res) => {
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
    let formId;
    if(window.location.href.includes('single')) {
        formId = window.location.href.split('forms/')[1].split('/')[1];
    } else {
        formId = window.location.href.split('forms/')[1].split('/')[1];
    }
    const options = { username: host, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    let params = {
        fileName: `public/forms/${formId}.json`, 
        options
    }
    let fetchedForm = await fetchData(params);
    console.log(fetchedForm);
    setGlobal({ publicForm: JSON.parse(fetchedForm), loading: false  });
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
        let serverUrl;
        environment.includes('local') ? serverUrl = 'http://localhost:5000' : serverUrl = 'https://socket.graphitedocs.com';
        const headerObj = {
            headers: {
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json'
            }, 
        }
        axios.post(`${serverUrl}/public/organization/${orgId}/forms/${formId}/user/${user}`, JSON.stringify(thisResponse), headerObj)
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
        let serverUrl;
        environment.includes('local') ? serverUrl = 'http://localhost:5000' : serverUrl = 'https://socket.graphitedocs.com';
        const headerObj = {
            headers: {
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json'
            }, 
        }
        axios.post(`${serverUrl}/public/organization/${orgId}/forms/${formId}`, JSON.stringify(thisResponse), headerObj)
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