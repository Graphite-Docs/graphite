import { getGlobal, setGlobal } from 'reactn';
import { loadData } from '../../shared/helpers/accountContext';
import { ToastsStore} from 'react-toasts';
import { postData } from '../../shared/helpers/post';

export function collabFilter(props) {
    let docs = getGlobal().documents;
    let collaboratorFilter = docs.filter(x => typeof x.sharedWith !== 'undefined' ? x.sharedWith.includes(props) : console.log(""));
    setGlobal({ filteredDocs: collaboratorFilter, appliedFilter: true});
  }
  
  export function tagFilter(props) {
    let docs = getGlobal().documents;
    let tagFilter = docs.filter(x => typeof x.singleDocTags !== 'undefined' ? x.singleDocTags.includes(props) : null);
    setGlobal({ filteredDocs: tagFilter, appliedFilter: true});
  }
  
  export function dateFilter(props) {
    let docs = getGlobal().documents;
    let definedDate = docs.filter((val) => { return val.updated !==undefined });
    let dateFilter = definedDate.filter(x => x.updated.includes(props));
    setGlobal({ filteredDocs: dateFilter, appliedFilter: true});
  }
  
  export function clearFilter() {
    setGlobal({ appliedFilter: false, filteredDocs: getGlobal().documents});
  }
  
  export function setDocsPerPage(e) {
    setGlobal({ docsPerPage: e.target.value});
  }

  export function handlePageChange(props) {
    setGlobal({
      currentPage: props
    });
  }

  export function filterList(event){
    var updatedList = getGlobal().documents;
    updatedList = updatedList.filter(function(item){
      if(item.title !== undefined) {
        return item.title.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1;
      }
      return null;
    });
    setGlobal({filteredDocs: updatedList});
  }

  export async function deleteDoc(doc) {
    //First we delete the file from the index
    let docs = await getGlobal().documents;
    let index = await docs.map((x) => {return x.id }).indexOf(doc.id);
    docs.splice(index, 1);
    await setGlobal({ documents: docs, deleteModalOpen: false });
    ToastsStore.success(`Deleting document...`)
    try {
      let file = 'documentscollection.json';
      let docsParams = {
          fileName: file, 
          body: JSON.stringify(getGlobal().documents), 
          encrypt: true
      }
      const updatedDocIndex = await postData(docsParams);
      console.log(updatedDocIndex);
    } catch(error) {
      console.log(error)
    }

    //Now we have to save an empty file for the singleDoc
    const empty = {};
    try {
      let singleDocFile = `/documents/${doc.id}.json`;
      let singleDocParams = {
          fileName: singleDocFile, 
          body: JSON.stringify(empty), 
          encrypt: true
      }
      const singleDocEmpty = await postData(singleDocParams);
      console.log(singleDocEmpty);
      ToastsStore.success(`Document deleted!`);
      loadData({refresh: false});
    } catch(error) {
      console.log(error)
    }
  }



