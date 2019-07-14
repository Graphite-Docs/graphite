import {setGlobal, getGlobal} from 'reactn';
import { ToastsStore} from 'react-toasts';
import { postData } from '../../shared/helpers/post';
import { loadData } from '../../shared/helpers/accountContext';


export async function handleDeleteFormItem(form) {
  //First we delete the file from the index
  let forms = await getGlobal().forms;
  let index = await forms.map((x) => {return x.id }).indexOf(form.id);
  if(index > -1) {
    forms.splice(index, 1);
    await setGlobal({ forms, filteredForms: forms, deleteModalOpen: false });
    ToastsStore.success(`Deleting form...`)
    try {
      let formName = 'forms.json';
      let formIndexParams = {
          fileName: formName, 
          body: JSON.stringify(getGlobal().forms), 
          encrypt: true
      }
      const updatedFormIndex = await postData(formIndexParams);
      console.log(updatedFormIndex);
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
    let singleFormPath = `forms/${form.id}.json`;
    let singleFormParams = {
        fileName: singleFormPath, 
        body: JSON.stringify(empty), 
        encrypt: true
    }
    const singleFormEmpty = await postData(singleFormParams);
    console.log(singleFormEmpty);
    ToastsStore.success(`Form deleted!`);
    loadData({refresh: false});
  } catch(error) {
    console.log(error)
  }
}

export function filterFormsList(event){
    var updatedList = getGlobal().forms;
    updatedList = updatedList.filter(function(item){
      return item.title.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    setGlobal({filteredForms: updatedList});
  }
  
export function handlePageChange(number) {
    setGlobal({
    currentPage: number
    });
}

export function applyFormsFilter() {
    setGlobal({ applyFilter: false });
    setTimeout(filterFormsNow, 500);
  }

  export function filterFormsNow() {
    let forms = getGlobal().forms;
    if(getGlobal().selectedTag !== "") {
      let tagFilter = forms.filter(x => typeof x.tags !== 'undefined' ? x.tags.includes(getGlobal().selectedTag) : null);
      // let tagFilter = files.filter(x => x.tags.includes(getGlobal().selectedTag));
      setGlobal({ filteredForms: tagFilter, appliedFilter: true});
    } else if (getGlobal().selectedDate !== "") {
      let definedDate = forms.filter((val) => { return val.created !==undefined });
      let dateFilter = definedDate.filter(x => x.created.includes(getGlobal().selectedDate));
      setGlobal({ filteredForms: dateFilter, appliedFilter: true});
    } 
  }

  export function clearFormFilter() {
    setGlobal({ appliedFilter: false, filteredForms: getGlobal().forms });
  }

  export function tagFormsFilter(tag, type) {
    setGlobal({ selectedTag: tag }, () => {
      filterFormsNow(type);
    });
  }

  export function dateFormsFilter(date, type) {
    setGlobal({ selectedDate: date }, () => {
      filterFormsNow(type);
    });
  }

  export function setPagination(e) {
    setGlobal({ formsPerPage: e.target.value });
  }

  export function setFormsPages(e) {
    setGlobal({ formsPerPage: e.target.value });
  }

  export function deleteTeamForm(form) {
    console.log(form);
  }