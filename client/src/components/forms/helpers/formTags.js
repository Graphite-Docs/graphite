import { setGlobal, getGlobal } from 'reactn';
import update from 'immutability-helper';
import { fetchData } from '../../shared/helpers/fetch';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
import { loadData } from '../../shared/helpers/accountContext';

export function setFormsTags(e) {
    setGlobal({ tag: e.target.value});
}

export function checkKey(event) {
    if(event.key === "Enter") {
        if(getGlobal().tag !== "") {
            addFormsTagManual();
        }
    }
}

export function addFormsTagManual() {
    let tags = getGlobal().tags;
    setGlobal({ tags: [...tags, getGlobal().tag]}, () => {
    setGlobal({ tag: "" });
    });
}

export async function loadSingleFormTags(form) {
    let formParams = {
        fileName: `forms/${form.id}.json`, 
        decrypt: true
    }
    let thisForm = await fetchData(formParams);
    setGlobal({ singleForm: JSON.parse(thisForm), tags: JSON.parse(thisForm).tags });
}

export async function deleteFormTag(tag) {
    let tags = getGlobal().tags;
    let index = await tags.map((x) => {return x }).indexOf(tag);
    tags.splice(index, 1);
    setGlobal({tags: tags})
}

export async function saveTags() {
    setGlobal({tagModalOpen: false})
    ToastsStore.success(`Saving tags...`)
    let form = getGlobal().singleForm;
    form["tags"] = getGlobal().tags;
    //Save the single file first
    try {
        let singleFormParams = {
            fileName: `forms/${form.id}.json`, 
            body: JSON.stringify(form), 
            encrypt: true
        }
        let postedForm = await postData(singleFormParams)
        console.log(postedForm)
    } catch(error) {
        console.log(error)
    }
    //Then update the forms collection and save it
    let forms = await getGlobal().forms;
    let index = await forms.map((x) => {return x.id }).indexOf(form.id);
    const indexObject = {
        created: form.created,
        timestamp: form.timestamp, 
        title: form.title,
        tags: getGlobal().tags,
        id: form.id, 
        fileType: "forms"
    }
    const updatedForms = update(getGlobal().forms, {$splice: [[index, 1, indexObject]]});
    await setGlobal({
      forms: updatedForms
    })
    try {   
        let formIndexParams = {
            fileName: 'forms.json', 
            body: JSON.stringify(getGlobal().forms), 
            encrypt: true
        }
        const updatedFormIndex = await postData(formIndexParams);
        console.log(updatedFormIndex);
        ToastsStore.success(`Tags saved!`)
        loadData({refresh: false});
    } catch(error) {
        console.log(error)
    }
}