import {setGlobal, getGlobal} from 'reactn';
import { ToastsStore} from 'react-toasts';
import { postData } from '../../shared/helpers/post';
import { loadData } from '../../shared/helpers/accountContext';


export async function handleDeleteVaultItem(file) {
  //First we delete the file from the index
  let files = await getGlobal().files;
  let index = await files.map((x) => {return x.id }).indexOf(file.id);
  if(index > -1) {
    files.splice(index, 1);
    await setGlobal({ files, filteredFiles: files, deleteModalOpen: false });
    ToastsStore.success(`Deleting file...`)
    try {
      let file = 'uploads.json';
      let fileIndexParams = {
          fileName: file, 
          body: JSON.stringify(getGlobal().files), 
          encrypt: true
      }
      const updatedFileIndex = await postData(fileIndexParams);
      console.log(updatedFileIndex);
    } catch(error) {
      console.log(error)
    }
  } else {
    ToastsStore.error(`Error deleting`)
    console.log("Problem with index");
  }

  //Now we have to save an empty file for the singleDoc
  const empty = {};
  try {
    let singleFilePath = `${file.id}.json`;
    let singleFileParams = {
        fileName: singleFilePath, 
        body: JSON.stringify(empty), 
        encrypt: true
    }
    const singleFileEmpty = await postData(singleFileParams);
    console.log(singleFileEmpty);
    ToastsStore.success(`File deleted!`);
    loadData({refresh: false});
  } catch(error) {
    console.log(error)
  }
}

export function filterVaultList(event){
    var updatedList = getGlobal().files;
    updatedList = updatedList.filter(function(item){
      return item.name.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    setGlobal({filteredFiles: updatedList});
  }
  
export function handlePageChange(number) {
    setGlobal({
    currentPage: number
    });
}

export function applyVaultFilter() {
    setGlobal({ applyFilter: false });
    setTimeout(filterVaultNow, 500);
  }

  export function filterVaultNow() {
    let files = getGlobal().files;
    if(getGlobal().selectedTag !== "") {
      let tagFilter = files.filter(x => typeof x.tags !== 'undefined' ? x.tags.includes(getGlobal().selectedTag) : null);
      // let tagFilter = files.filter(x => x.tags.includes(getGlobal().selectedTag));
      setGlobal({ filteredFiles: tagFilter, appliedFilter: true});
    } else if (getGlobal().selectedDate !== "") {
      let definedDate = files.filter((val) => { return val.uploaded !==undefined });
      let dateFilter = definedDate.filter(x => x.uploaded.includes(getGlobal().selectedDate));
      setGlobal({ filteredFiles: dateFilter, appliedFilter: true});
    } else if (getGlobal().selectedCollab !== "") {
      let collaboratorFilter = files.filter(x => typeof x.sharedWithSingle !== 'undefined' ? x.sharedWithSingle.includes(getGlobal().selectedCollab) : null);
      // let collaboratorFilter = files.filter(x => x.sharedWith.includes(getGlobal().selectedCollab));
      setGlobal({ filteredFiles: collaboratorFilter, appliedFilter: true});
    } else if(getGlobal().selectedType) {
      let typeFilter = files.filter(x => x.type.includes(getGlobal().selectedType));
      setGlobal({ filteredFiles: typeFilter, appliedFilter: true});
    }
  }

  export function clearVaultFilter() {
    setGlobal({ appliedFilter: false, filteredFiles: getGlobal().files });
  }

  export function collabVaultFilter(collab, type) {
    setGlobal({ selectedCollab: collab }, () => {
      filterVaultNow(type);
    });
  }

  export function tagVaultFilter(tag, type) {
    setGlobal({ selectedTag: tag }, () => {
      filterVaultNow(type);
    });
  }

  export function dateVaultFilter(date, type) {
    setGlobal({ selectedDate: date }, () => {
      filterVaultNow(type);
    });
  }

  export function typeVaultFilter(props) {
    setGlobal({ selectedType: props });
    setTimeout(filterVaultNow, 300);
  }

  export function setPagination(e) {
    setGlobal({ filesPerPage: e.target.value });
  }

  export function handleVaultPageChange(number) {
    setGlobal({
      currentVaultPage: number
    });
  }

  export function setVaultPages(e) {
    setGlobal({ filesPerPage: e.target.value });
  }