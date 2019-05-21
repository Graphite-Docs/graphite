import { setGlobal, getGlobal } from 'reactn';
import { fetchData } from '../../shared/helpers/fetch';
import { ToastsStore} from 'react-toasts';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { postData } from '../../shared/helpers/post';
import update from 'immutability-helper';
const uuid = require('uuidv4');

export async function loadForm(id) {
    setGlobal({ formLoading: true });
    const formParams = {
        fileName: `forms/${id}.json`, 
        decrypt: true
    }
    const form = await fetchData(formParams);
    if(JSON.parse(form)) {
        setGlobal({ singleForm: JSON.parse(form), formLoading: false})
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
                questions: []
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

export async function saveForm() {
    let singleForm = getGlobal().singleForm;
    const formObject = {
        id: singleForm.id,
        tags: singleForm.tags,
        title: singleForm.title,
        created: singleForm.created,
        lastUpdated: Date.now(),
        questions: singleForm.questions
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
            body: JSON.stringify(forms)
        }
        const newIndex = await postData(newFormIndex);
        console.log(newIndex);
        ToastsStore.success(`Form saved`);
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