import {setGlobal, getGlobal} from 'reactn';

export function handleDeleteVaultItem() {

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