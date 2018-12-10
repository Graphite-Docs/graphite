import {
  getFile,
  putFile,
  loadUserData
} from 'blockstack';
import axios from 'axios';
import update from 'immutability-helper';
const { encryptECIES } = require('blockstack/lib/encryption');

export function loadFilesCollection() {
  getFile("uploads.json", {decrypt: true})
   .then((fileContents) => {
     console.log(JSON.parse(fileContents || '{}'))
     if(fileContents){
       this.setState({ files: JSON.parse(fileContents || '{}') });
       this.setState({filteredVault: this.state.files});
     }else {
       this.setState({ files: [] });
       this.setState({ filteredVault: [] });
     }
   })
    .catch(error => {
      console.log(error);
      this.setState({ files: [], filteredValue: [] });
    });
}

export function filterVaultList(event){
  var updatedList = this.state.files;
  updatedList = updatedList.filter(function(item){
    return item.name.toLowerCase().search(
      event.target.value.toLowerCase()) !== -1;
  });
  this.setState({filteredVault: updatedList});
}

export function handleVaultPageChange(event) {
    this.setState({
      currentVaultPage: Number(event.target.id)
    });
  }

export function  handleVaultCheckbox(event) {
    let checkedArray = this.state.filesSelected;
      let selectedValue = event.target.value;

        if (event.target.checked === true) {
          checkedArray.push(selectedValue);
            this.setState({
              filesSelected: checkedArray
            });
          if(checkedArray.length === 1) {
            this.setState({activeIndicator: true});

          } else {
            this.setState({activeIndicator: false});
          }
        } else {
          this.setState({activeIndicator: false});
          let valueIndex = checkedArray.indexOf(selectedValue);
            checkedArray.splice(valueIndex, 1);

            this.setState({
              filesSelected: checkedArray
            });
            if(checkedArray.length === 1) {
              this.setState({activeIndicator: true});
            } else {
              this.setState({activeIndicator: false});
            }
        }
  }

export function sharedVaultInfo(contact, file) {
    this.setState({ confirmAdd: false, receiverID: contact });
    const user = contact;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    this.setState({ loading: true });
    getFile('key.json', options)
      .then((file) => {
        if(file) {
          this.setState({ pubKey: JSON.parse(file)})
        } else {
          console.log("No key");
          this.setState({ loading: false, displayMessage: true}, () => {
            setTimeout(() => this.setState({ displayMessage: false}), 3000)
          })
        }
      })
      .then(() => {
        getFile('graphiteprofile.json', options)
          .then((fileContents) => {
            if(fileContents) {
              if(JSON.parse(fileContents).emailOK) {
                const object = {};
                object.sharedBy = loadUserData().username;
                object.from_email = "contact@graphitedocs.com";
                object.to_email = JSON.parse(fileContents).profileEmail;
                if(window.location.href.includes('/vault')) {
                  object.subject = 'New Graphite Vault File Shared by ' + loadUserData().username;
                  object.link = window.location.origin + '/vault/single/shared/' + loadUserData().username + '/' + this.state.filesSelected[0];
                  object.content = "<div style='text-align:center;'><div style='background:#282828;width:100%;height:auto;margin-bottom:40px;'><h3 style='margin:15px;color:#fff;'>Graphite</h3></div><h3>" + loadUserData().username + " has shared a file with you.</h3><p>Access it here:</p><br><a href=" + object.link + ">" + object.link + "</a></div>"
                  axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/file-shared', object)
                    .then((res) => {
                      console.log(res);
                    })
                  console.log(object);
                }
              }
            }
          })
        })
        .then(() => {
          if(this.state.loading) {
            this.loadSharedVaultCollection(contact, file);
          }
        })
        .catch(error => {
          console.log("No key: " + error);
          this.setState({ loading: false, displayMessage: true}, () => {
            setTimeout(() => this.setState({ displayMessage: false}), 3000)
          })
        });
  }

export function loadSharedVaultCollection(contact, file) {
  const user = contact;
  const fileName = "sharedvault.json";
  getFile(user + fileName, {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        this.setState({ sharedCollection: JSON.parse(fileContents || '{}') })
      } else {
        this.setState({ sharedCollection: [] });
      }
    })
    .then(() => {
      this.loadVaultSingle(contact, file);
    })
    .catch((error) => {
      console.log(error)
    });
}

export function loadVaultSingle(contact, file) {
  const thisFile = file.id;
  const fullFile = thisFile + '.json';

  getFile(fullFile, {decrypt: true})
   .then((fileContents) => {
     if(JSON.parse(fileContents || '{}').sharedWith) {
       this.setState({
         file: JSON.parse(fileContents || "{}").file,
         name: JSON.parse(fileContents || "{}").name,
         lastModifiedDate: JSON.parse(fileContents || "{}").lastModifiedDate,
         size: JSON.parse(fileContents || "{}").size,
         link: JSON.parse(fileContents || "{}").link,
         type: JSON.parse(fileContents || "{}").type,
         id: JSON.parse(fileContents || "{}").id,
         sharedWithSingle: JSON.parse(fileContents || "{}").sharedWith,
         singleFileTags: JSON.parse(fileContents || "{}").tags || [],
         uploaded: JSON.parse(fileContents || "{}").uploaded
      });
    } else {
      this.setState({
        file: JSON.parse(fileContents || "{}").file,
        name: JSON.parse(fileContents || "{}").name,
        lastModifiedDate: JSON.parse(fileContents || "{}").lastModifiedDate,
        size: JSON.parse(fileContents || "{}").size,
        link: JSON.parse(fileContents || "{}").link,
        id: JSON.parse(fileContents || "{}").id,
        type: JSON.parse(fileContents || "{}").type,
        sharedWithSingle: [],
        singleFileTags: JSON.parse(fileContents || "{}").tags || [],
        uploaded: JSON.parse(fileContents || "{}").uploaded
     });
    }

   })
    .then(() => {
      this.setState({ sharedWithSingle: [...this.state.sharedWithSingle, this.state.receiverID] }, () => {
        this.getVaultCollection(contact, file);
      });
    })
    .catch(error => {
      console.log(error);
    });
}

export function getVaultCollection(contact, file) {
  getFile("uploads.json", {decrypt: true})
  .then((fileContents) => {
    console.log(JSON.parse(fileContents || '{}'))
     this.setState({ files: JSON.parse(fileContents || '{}') })
     this.setState({ initialLoad: "hide" });
  }).then(() =>{
    let files = this.state.files;
    const thisFile = files.find((a) => { return a.id.toString() === file.id.toString()}); //this is comparing strings
    let index = thisFile && thisFile.id;
    function findObjectIndex(file) {
        return file.id === index; //this is comparing numbers
    }
    this.setState({index: files.findIndex(findObjectIndex) });
  })
    .then(() => {
      this.vaultShare(contact, file);
    })
    .catch(error => {
      console.log(error);
    });
}

export function vaultShare(contact, file) {
  const object = {};
  object.name = this.state.name;
  object.file = this.state.file;
  object.id = file.id;
  object.lastModifiedDate = this.state.lastModifiedDate;
  object.sharedWith = this.state.sharedWithSingle;
  object.size = this.state.size;
  object.link = this.state.link;
  object.type = this.state.type;
  object.tags = this.state.singleFileTags;
  object.uploaded = this.state.uploaded;
  const index = this.state.index;
  const updatedFiles = update(this.state.files, {$splice: [[index, 1, object]]});  // array.splice(start, deleteCount, item1)
  this.setState({files: updatedFiles, singleFile: object, sharedCollection: [...this.state.sharedCollection, object]}, () => {
    this.saveSharedVaultFile(contact, file);
  });
}

export function saveSharedVaultFile(contact, file) {
  const user = contact;
  const userShort = user.slice(0, -3);
  const fileName = "sharedvault.json";

  putFile(userShort + fileName, JSON.stringify(this.state.sharedCollection), {encrypt: true})
    .then(() => {
      console.log("Shared Collection Saved");
      this.saveSingleVaultFile(contact, file);
    })
    .catch(error => {
      console.log("Error")
      this.setState({ loading: false });
    })
}

export function saveSingleVaultFile(contact, file) {
  const fileID = file.id;
  const fullFile = fileID + '.json'
  putFile(fullFile, JSON.stringify(this.state.singleFile), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      this.saveVaultCollection(contact, file);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveVaultCollection(contact, file) {
    putFile("uploads.json", JSON.stringify(this.state.files), {encrypt: true})
      .then(() => {
        console.log("Saved Collection");
        this.sendVaultFile(contact, file);
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

export function sendVaultFile(contact, file) {
  const user = contact;
  const userShort = user.slice(0, -3);
  const fileName = 'sharedvault.json'
  const fileFull = userShort + fileName;
  const publicKey = this.state.pubKey;
  const data = this.state.sharedCollection;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const directory = '/shared/' + fileFull;
  putFile(directory, encryptedData, {encrypt: false})
    .then(() => {
      console.log("Shared encrypted file ");
      this.loadVault();
      this.setState({ loading: false });

    })
    .catch(e => {
      console.log(e);
    });
}

export function loadSingleVaultTags(file) {
  this.setState({tagDownload: false});
  const thisFile = file.id
  const fullFile = thisFile + '.json';
  getFile(fullFile, {decrypt: true})
   .then((fileContents) => {
     console.log(JSON.parse(fileContents || '{}'))
     if(JSON.parse(fileContents || '{}').singleFileTags) {
       this.setState({
         shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
         name: JSON.parse(fileContents || '{}').name,
         id: JSON.parse(fileContents || '{}').id,
         lastModifiedDate: JSON.parse(fileContents || '{}').lastModifiedDate,
         sharedWithSingle: JSON.parse(fileContents || '{}').sharedWith || [],
         singleFileTags: JSON.parse(fileContents || '{}').singleFileTags,
         file: JSON.parse(fileContents || "{}").file,
         size: JSON.parse(fileContents || "{}").size,
         link: JSON.parse(fileContents || "{}").link,
         type: JSON.parse(fileContents || "{}").type,
         uploaded: JSON.parse(fileContents || "{}").uploaded
      });
    } else {
      this.setState({
        shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
        name: JSON.parse(fileContents || '{}').name,
        id: JSON.parse(fileContents || '{}').id,
        lastModifiedDate: JSON.parse(fileContents || '{}').lastModifiedDate,
        sharedWithSingle: JSON.parse(fileContents || '{}').sharedWith || [],
        singleFileTags: [],
        file: JSON.parse(fileContents || "{}").file,
        size: JSON.parse(fileContents || "{}").size,
        link: JSON.parse(fileContents || "{}").link,
        type: JSON.parse(fileContents || "{}").type,
        uploaded: JSON.parse(fileContents || "{}").uploaded
     });
    }
   })
   .then(() => {
     this.getVaultCollectionTags(file);
   })
    .catch(error => {
      console.log(error);
    });
}

export function getVaultCollectionTags(file) {
  getFile("uploads.json", {decrypt: true})
  .then((fileContents) => {
     this.setState({ files: JSON.parse(fileContents || '{}') })
     this.setState({ initialLoad: "hide" });
  }).then(() =>{
    let files = this.state.files;
    const thisFile = files.find((a) => {return a.id.toString() === file.id.toString()}); //this is comparing strings
    let index = thisFile && thisFile.id;
    function findObjectIndex(a) {
        return a.id === index; //this is comparing numbers
    }
    this.setState({index: files.findIndex(findObjectIndex) });
  })
    .catch(error => {
      console.log(error);
    });
}

export function setVaultTags(e) {
  this.setState({ tag: e.target.value});
}

export function handleVaultKeyPress(e) {
    if (e.key === 'Enter') {
      this.setState({ singleFileTags: [...this.state.singleFileTags, this.state.tag]}, () => {
        this.setState({ tag: "" });
      });

    }
  }

export function addVaultTagManual() {
    this.setState({ singleFileTags: [...this.state.singleFileTags, this.state.tag]}, () => {
      this.setState({ tag: "" });
    });
  }

export function saveNewVaultTags(file) {
    this.setState({ loading: true });
    const object = {};
    object.name = this.state.name;
    object.file = this.state.file;
    object.id = this.state.id;
    object.lastModifiedDate = this.state.lastModifiedDate;
    object.sharedWith = this.state.sharedWithSingle;
    object.size = this.state.size;
    object.link = this.state.link;
    object.type = this.state.type;
    object.singleFileTags = this.state.singleFileTags;
    object.uploaded = this.state.uploaded;
    const index = this.state.index;
    const objectTwo = {};
    objectTwo.name = this.state.name;
    objectTwo.file = this.state.file;
    objectTwo.id = this.state.id;
    objectTwo.lastModifiedDate = this.state.lastModifiedDate;
    objectTwo.sharedWith = this.state.sharedWithSingle;
    objectTwo.singleFileTags = this.state.singleFileTags;
    objectTwo.type = this.state.type;
    objectTwo.uploaded = this.state.uploaded;
    const updatedFile = update(this.state.files, {$splice: [[index, 1, objectTwo]]});
    this.setState({files: updatedFile, filteredValue: updatedFile, singleFile: object }, () => {
      this.saveFullVaultCollectionTags(file);
    });
  }

export function  saveFullVaultCollectionTags(file) {
    putFile("uploads.json", JSON.stringify(this.state.files), {encrypt: true})
      .then(() => {
        console.log("Saved");
        this.saveSingleVaultFileTags(file);
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  export function saveSingleVaultFileTags(file) {
      const thisFile = file.id;
      const fullFile = thisFile + '.json';
      putFile(fullFile, JSON.stringify(this.state.singleFile), {encrypt:true})
        .then(() => {
          console.log("Saved tags");
          this.setState({ loading: false });
          this.loadFilesCollection();
        })
        .catch(e => {
          console.log("e");
          console.log(e);
        });
    }

export function applyVaultFilter() {
    this.setState({ applyFilter: false });
    setTimeout(this.filterVaultNow, 500);
  }

export function filterVaultNow() {
    console.log(this.state.selectedCollab);
    console.log(this.state.files);
    let files = this.state.files;
    if(this.state.selectedTag !== "") {
      let tagFilter = files.filter(x => typeof x.singleFileTags !== 'undefined' ? x.singleFileTags.includes(this.state.selectedTag) : null);
      // let tagFilter = files.filter(x => x.tags.includes(this.state.selectedTag));
      this.setState({ filteredVault: tagFilter, appliedFilter: true});
    } else if (this.state.selectedDate !== "") {
      let definedDate = files.filter((val) => { return val.uploaded !==undefined });
      console.log(definedDate);
      let dateFilter = definedDate.filter(x => x.uploaded.includes(this.state.selectedDate));
      this.setState({ filteredVault: dateFilter, appliedFilter: true});
    } else if (this.state.selectedCollab !== "") {
      let collaboratorFilter = files.filter(x => typeof x.sharedWith !== 'undefined' ? x.sharedWith.includes(this.state.selectedCollab) : null);
      // let collaboratorFilter = files.filter(x => x.sharedWith.includes(this.state.selectedCollab));
      this.setState({ filteredVault: collaboratorFilter, appliedFilter: true});
    } else if(this.state.selectedType) {
      let typeFilter = files.filter(x => x.type.includes(this.state.selectedType));
      this.setState({ filteredVault: typeFilter, appliedFilter: true});
    }
  }

export function clearVaultFilter() {
  this.setState({ appliedFilter: false, filteredVault: this.state.files });
}
export function deleteVaultTag(props) {
    this.setState({ deleteState: false, selectedTagId: props });

    let tags = this.state.singleFileTags;
    const thisTag = tags.find((tag) => { return tag === props}); //this is comparing strings
    let index = thisTag;
    function findObjectIndex(tag) {
        return tag === index; //this is comparing numbers
    }
    this.setState({ tagIndex: tags.findIndex(findObjectIndex) }, () => {
      const updatedTags = update(this.state.singleFileTags, {$splice: [[this.state.tagIndex, 1]]});
      this.setState({singleFileTags: updatedTags });
    });
  }

  export function collabVaultFilter(collab, type) {
    this.setState({ selectedCollab: collab }, () => {
      this.filterVaultNow(type);
    });
  }

  export function tagVaultFilter(tag, type) {
    this.setState({ selectedTag: tag }, () => {
      this.filterVaultNow(type);
    });
  }

  export function dateVaultFilter(date, type) {
    this.setState({ selectedDate: date }, () => {
      this.filterVaultNow(type);
    });
  }

  export function typeVaultFilter(props) {
    this.setState({ selectedType: props });
    setTimeout(this.filterVaultNow, 300);
  }

  export function setPagination(e) {
    this.setState({ filesPerPage: e.target.value });
  }
