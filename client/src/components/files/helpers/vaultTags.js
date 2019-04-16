import { setGlobal, getGlobal } from 'reactn';
import update from 'immutability-helper';
import { fetchData } from '../../shared/helpers/fetch';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
import { loadData } from '../../shared/helpers/accountContext';

export function setVaultTags(e) {
    setGlobal({ tag: e.target.value});
}

export function checkKey(event) {
    if(event.key === "Enter") {
        if(getGlobal().tag !== "") {
            addVaultTagManual();
        }
    }
}

export function addVaultTagManual() {
    let tags = getGlobal().tags;
    setGlobal({ tags: [...tags, getGlobal().tag]}, () => {
    setGlobal({ tag: "" });
    });
}

export async function loadSingleVaultTags(file) {
    let fileParams = {
        fileName: `${file.id}.json`, 
        decrypt: true
    }
    let thisFile = await fetchData(fileParams);
    setGlobal({ singleFile: JSON.parse(thisFile), tags: JSON.parse(thisFile).tags });
}

export async function deleteVaultTag(tag) {
    let tags = getGlobal().tags;
    let index = await tags.map((x) => {return x }).indexOf(tag);
    tags.splice(index, 1);
    setGlobal({tags: tags})
}

export async function saveTags() {
    setGlobal({tagModalOpen: false})
    ToastsStore.success(`Saving tags...`)
    let file = getGlobal().singleFile;
    file["tags"] = getGlobal().tags;
    //Save the single file first
    try {
        let singleFileParams = {
            fileName: `${file.id}.json`, 
            body: JSON.stringify(file), 
            encrypt: true
        }
        let postedFile = await postData(singleFileParams)
        console.log(postedFile)
    } catch(error) {
        console.log(error)
    }
    //Then update the file collection and save it
    let files = await getGlobal().files;
    let index = await files.map((x) => {return x.id }).indexOf(file.id);
    const indexObject = {
        uploaded: file.uploaded,
        timestamp: file.timestamp, 
        name: file.name,
        size: file.size,
        type: file.type,
        tags: getGlobal().tags,
        sharedWithSingle: file.sharedWithSingle,
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        id: file.id, 
        fileType: "vault"
    }
    const updatedFiles = update(getGlobal().files, {$splice: [[index, 1, indexObject]]});
    await setGlobal({
      files: updatedFiles
    })
    try {   
        let fileIndexParams = {
            fileName: 'uploads.json', 
            body: JSON.stringify(getGlobal().files), 
            encrypt: true
        }
        const updatedFileIndex = await postData(fileIndexParams);
        console.log(updatedFileIndex);
        ToastsStore.success(`Tags saved!`)
        loadData({refresh: false})
    } catch(error) {
        console.log(error)
    }
}