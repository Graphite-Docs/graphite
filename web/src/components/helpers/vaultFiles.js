import {
  getFile,
  putFile,
  loadUserData, 
  decryptContent
} from 'blockstack';
import { loadVault } from './helpers';
import { saveNewVaultFile } from './newVaultFile';
import { fetchFromProvider } from './storageProviders/fetch';
import { getGlobal, setGlobal } from 'reactn';
import axios from 'axios';
import update from 'immutability-helper';
const { encryptECIES } = require('blockstack/lib/encryption');

export function loadFilesCollection() {
  getFile("uploads.json", {decrypt: true})
   .then((fileContents) => {
     console.log(JSON.parse(fileContents || '{}'))
     if(fileContents){
       setGlobal({ files: JSON.parse(fileContents || '{}') });
       setGlobal({filteredVault: getGlobal().files});
     }else {
       setGlobal({ files: [] });
       setGlobal({ filteredVault: [] });
     }
   })
    .catch(error => {
      console.log(error);
      setGlobal({ files: [], filteredValue: [] });
    });
}

export function filterVaultList(event){
  var updatedList = getGlobal().files;
  updatedList = updatedList.filter(function(item){
    return item.name.toLowerCase().search(
      event.target.value.toLowerCase()) !== -1;
  });
  setGlobal({filteredVault: updatedList});
}

export function handleVaultPageChange(event) {
    setGlobal({
      currentVaultPage: Number(event.target.id)
    });
  }

export function  handleVaultCheckbox(event) {
    let checkedArray = getGlobal().filesSelected;
      let selectedValue = event.target.value;

        if (event.target.checked === true) {
          checkedArray.push(selectedValue);
            setGlobal({
              filesSelected: checkedArray
            });
          if(checkedArray.length === 1) {
            setGlobal({activeIndicator: true});

          } else {
            setGlobal({activeIndicator: false});
          }
        } else {
          setGlobal({activeIndicator: false});
          let valueIndex = checkedArray.indexOf(selectedValue);
            checkedArray.splice(valueIndex, 1);

            setGlobal({
              filesSelected: checkedArray
            });
            if(checkedArray.length === 1) {
              setGlobal({activeIndicator: true});
            } else {
              setGlobal({activeIndicator: false});
            }
        }
  }

export function sharedVaultInfo(contact, file) {
    setGlobal({ confirmAdd: false, receiverID: contact });
    const user = contact;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    setGlobal({ loading: true });
    getFile('key.json', options)
      .then((file) => {
        if(file) {
          setGlobal({ pubKey: JSON.parse(file)})
        } else {
          console.log("No key");
          setGlobal({ loading: false, displayMessage: true}, () => {
            setTimeout(() => setGlobal({ displayMessage: false}), 3000)
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
                  object.link = window.location.origin + '/vault/single/shared/' + loadUserData().username + '/' + getGlobal().filesSelected[0];
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
          if(getGlobal().loading) {
            loadSharedVaultCollection(contact, file);
          }
        })
        .catch(error => {
          console.log("No key: " + error);
          setGlobal({ loading: false, displayMessage: true}, () => {
            setTimeout(() => setGlobal({ displayMessage: false}), 3000)
          })
        });
  }

export async function loadSharedVaultCollection(contact, file) {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  const user = contact;
  const fileName = "sharedvault.json";
  if(authProvider === 'uPort') {
    const thisKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
    //Create the params to send to the fetchFromProvider function.
    const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
    let token;
    if(storageProvider === 'dropbox') {
      token = JSON.parse(localStorage.getItem('oauthData'))
    } else {
      token = JSON.parse(localStorage.getItem('oauthData')).data.access_token
    }
    const object = {
      provider: storageProvider,
      token: token,
      filePath: `/${fileName}`
    };
    //Call fetchFromProvider and wait for response.
    let fetchFile = await fetchFromProvider(object);
    console.log(fetchFile)
    if (fetchFile.loadLocal) {
      const decryptedContent = await JSON.parse(
        decryptContent(JSON.parse(fetchFile.data.content), {
          privateKey: thisKey
        })
      );
      await setGlobal(
        {
          sharedCollection: decryptedContent
        })
      } else {
        //No indexedDB data found, so we load and read from the API call.
        //Load up a new file reader and convert response to JSON.
        const reader = await new FileReader();
        var blob = fetchFile.fileBlob;
        reader.onloadend = async evt => {
          console.log("read success");
          const decryptedContent = await JSON.parse(
            decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey })
          );
          await setGlobal(
            {
              sharedCollection: decryptedContent
            })
          }
          console.log(blob);
        }

        //Now fetch single file.
        const params = {
          provider: storageProvider,
          token: token,
          filePath: `/vault/${file.id}.json`
        };
        //Call fetchFromProvider and wait for response.
        let singleFile = await fetchFromProvider(params);
        console.log(singleFile)
        if (fetchFile.loadLocal) {
          const decryptedContent = await JSON.parse(
            decryptContent(JSON.parse(fetchFile.data.content), {
              privateKey: thisKey
            })
          );
          await setGlobal(
            {
              file: decryptedContent.file,
              name: decryptedContent.name,
              lastModifiedDate: decryptedContent.lastModifiedDate,
              size: decryptedContent.size,
              link: decryptedContent.link,
              type: decryptedContent.type,
              id: decryptedContent.id,
              sharedWithSingle: decryptedContent.sharedWith,
              singleFileTags: decryptedContent.tags || [],
              uploaded: decryptedContent.uploaded
            })
          } else {
            //No indexedDB data found, so we load and read from the API call.
            //Load up a new file reader and convert response to JSON.
            const reader = await new FileReader();
            var blob2 = fetchFile.fileBlob;
            reader.onloadend = async evt => {
              console.log("read success");
              const decryptedContent = await JSON.parse(
                decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey })
              );
              await setGlobal(
                {
                  file: decryptedContent.file,
                  name: decryptedContent.name,
                  lastModifiedDate: decryptedContent.lastModifiedDate,
                  size: decryptedContent.size,
                  link: decryptedContent.link,
                  type: decryptedContent.type,
                  id: decryptedContent.id,
                  sharedWithSingle: decryptedContent.sharedWith,
                  singleFileTags: decryptedContent.tags || [],
                  uploaded: decryptedContent.uploaded
                })
              }
              console.log(blob2);
            }
  } else {
    getFile(user + fileName, {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        setGlobal({ sharedCollection: JSON.parse(fileContents || '{}') })
      } else {
        setGlobal({ sharedCollection: [] });
      }
    })
    .then(() => {
      loadVaultSingle(contact, file);
    })
    .catch((error) => {
      console.log(error)
    });
  }
}

export function loadVaultSingle(contact, file) {
  const thisFile = file.id;
  const fullFile = thisFile + '.json';

  getFile(fullFile, {decrypt: true})
   .then((fileContents) => {
     if(JSON.parse(fileContents || '{}').sharedWith) {
       setGlobal({
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
      setGlobal({
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
      setGlobal({ sharedWithSingle: [...getGlobal().sharedWithSingle, getGlobal().receiverID] }, () => {
        getVaultCollection(contact, file);
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
     setGlobal({ files: JSON.parse(fileContents || '{}') })
     setGlobal({ initialLoad: "hide" });
  }).then(() =>{
    let files = getGlobal().files;
    const thisFile = files.find((a) => { return a.id.toString() === file.id.toString()}); //this is comparing strings
    let index = thisFile && thisFile.id;
    function findObjectIndex(file) {
        return file.id === index; //this is comparing numbers
    }
    setGlobal({index: files.findIndex(findObjectIndex) });
  })
    .then(() => {
      vaultShare(contact, file);
    })
    .catch(error => {
      console.log(error);
    });
}

export function vaultShare(contact, file) {
  const object = {};
  object.name = getGlobal().name;
  object.file = getGlobal().file;
  object.id = file.id;
  object.lastModifiedDate = getGlobal().lastModifiedDate;
  object.sharedWith = getGlobal().sharedWithSingle;
  object.size = getGlobal().size;
  object.link = getGlobal().link;
  object.type = getGlobal().type;
  object.tags = getGlobal().singleFileTags;
  object.uploaded = getGlobal().uploaded;
  const index = getGlobal().index;
  const updatedFiles = update(getGlobal().files, {$splice: [[index, 1, object]]});  // array.splice(start, deleteCount, item1)
  setGlobal({files: updatedFiles, singleFile: object, sharedCollection: [...getGlobal().sharedCollection, object]}, () => {
    saveSharedVaultFile(contact, file);
  });
}

export function saveSharedVaultFile(contact, file) {
  const user = contact;
  const userShort = user.slice(0, -3);
  const fileName = "sharedvault.json";

  putFile(userShort + fileName, JSON.stringify(getGlobal().sharedCollection), {encrypt: true})
    .then(() => {
      console.log("Shared Collection Saved");
      saveSingleVaultFile(contact, file);
    })
    .catch(error => {
      console.log("Error")
      setGlobal({ loading: false });
    })
}

export function saveSingleVaultFile(contact, file) {
  const fileID = file.id;
  const fullFile = fileID + '.json'
  putFile(fullFile, JSON.stringify(getGlobal().singleFile), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      saveVaultCollection(contact, file);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveVaultCollection(contact, file) {
    putFile("uploads.json", JSON.stringify(getGlobal().files), {encrypt: true})
      .then(() => {
        console.log("Saved Collection");
        sendVaultFile(contact, file);
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
  const publicKey = getGlobal().pubKey;
  const data = getGlobal().sharedCollection;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const directory = '/shared/' + fileFull;
  putFile(directory, encryptedData, {encrypt: false})
    .then(() => {
      console.log("Shared encrypted file ");
      loadVault();
      setGlobal({ loading: false });

    })
    .catch(e => {
      console.log(e);
    });
}

export async function loadSingleVaultTags(file) {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  setGlobal({tagDownload: false});
  const thisFile = file.id
  const fullFile = thisFile + '.json';
  if(authProvider === 'uPort') {
    const thisKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
    //Create the params to send to the fetchFromProvider function.
    const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
    let token;
    if(storageProvider === 'dropbox') {
      token = JSON.parse(localStorage.getItem('oauthData'))
    } else {
      token = JSON.parse(localStorage.getItem('oauthData')).data.access_token
    }
    const object = {
      provider: storageProvider,
      token: token,
      filePath: `/vault/${fullFile}`
    };
    //Call fetchFromProvider and wait for response.
    let fetchFile = await fetchFromProvider(object);
    console.log(fetchFile)
    if (fetchFile.loadLocal) {
      const decryptedContent = await JSON.parse(
        decryptContent(JSON.parse(fetchFile.data.content), {
          privateKey: thisKey
        })
      );
      await setGlobal(
        {
          shareFile: [...getGlobal().shareFile, decryptedContent],
          name: decryptedContent.name,
          id: decryptedContent.id,
          lastModifiedDate: decryptedContent.lastModifiedDate,
          sharedWithSingle: decryptedContent.sharedWith || [],
          singleFileTags: decryptedContent.singleFileTags,
          file: decryptedContent.file,
          size: decryptedContent.size,
          link: decryptedContent.link,
          type: decryptedContent.type,
          uploaded: decryptedContent.uploaded
        })
      } else {
        //No indexedDB data found, so we load and read from the API call.
        //Load up a new file reader and convert response to JSON.
        const reader = await new FileReader();
        var blob = fetchFile.fileBlob;
        reader.onloadend = async evt => {
          console.log("read success");
          const decryptedContent = await JSON.parse(
            decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey })
          );
          await setGlobal(
            {
              shareFile: [...getGlobal().shareFile, decryptedContent],
              name: decryptedContent.name,
              id: decryptedContent.id,
              lastModifiedDate: decryptedContent.lastModifiedDate,
              sharedWithSingle: decryptedContent.sharedWith || [],
              singleFileTags: decryptedContent.singleFileTags || [],
              file: decryptedContent.file,
              size: decryptedContent.size,
              link: decryptedContent.link,
              type: decryptedContent.type,
              uploaded: decryptedContent.uploaded
            })
          }
          await console.log(reader.readAsText(blob));
        }
        let files = await getGlobal().files;
        const thisFile = files.find((a) => {return a.id.toString() === file.id.toString()}); //this is comparing strings
        let index = thisFile && thisFile.id;
        function findObjectIndex(a) {
            return a.id === index; //this is comparing numbers
        }
        setGlobal({index: files.findIndex(findObjectIndex) });
  } else {
    getFile(fullFile, {decrypt: true})
    .then((fileContents) => {
      console.log(JSON.parse(fileContents || '{}'))
      if(JSON.parse(fileContents || '{}').singleFileTags) {
        setGlobal({
          shareFile: [...getGlobal().shareFile, JSON.parse(fileContents || '{}')],
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
       setGlobal({
         shareFile: [...getGlobal().shareFile, JSON.parse(fileContents || '{}')],
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
      getVaultCollectionTags(file);
    })
     .catch(error => {
       console.log(error);
     });
  }
}

export function getVaultCollectionTags(file) {
  getFile("uploads.json", {decrypt: true})
  .then((fileContents) => {
     setGlobal({ files: JSON.parse(fileContents || '{}') })
     setGlobal({ initialLoad: "hide" });
  }).then(() =>{
    let files = getGlobal().files;
    const thisFile = files.find((a) => {return a.id.toString() === file.id.toString()}); //this is comparing strings
    let index = thisFile && thisFile.id;
    function findObjectIndex(a) {
        return a.id === index; //this is comparing numbers
    }
    setGlobal({index: files.findIndex(findObjectIndex) });
  })
    .catch(error => {
      console.log(error);
    });
}

export function setVaultTags(e) {
  setGlobal({ tag: e.target.value});
}

export function handleVaultKeyPress(e) {
    if (e.key === 'Enter') {
      setGlobal({ singleFileTags: [...getGlobal().singleFileTags, getGlobal().tag]}, () => {
        setGlobal({ tag: "" });
      });

    }
  }

export function addVaultTagManual() {
    setGlobal({ singleFileTags: [...getGlobal().singleFileTags, getGlobal().tag]}, () => {
      setGlobal({ tag: "" });
    });
  }

export function saveNewVaultTags(file) {
    setGlobal({ loading: true });
    const object = {};
    object.name = getGlobal().name;
    object.file = getGlobal().file;
    object.id = getGlobal().id;
    object.lastModifiedDate = getGlobal().lastModifiedDate;
    object.sharedWith = getGlobal().sharedWithSingle;
    object.size = getGlobal().size;
    object.link = getGlobal().link;
    object.type = getGlobal().type;
    object.singleFileTags = getGlobal().singleFileTags;
    object.uploaded = getGlobal().uploaded;
    const index = getGlobal().index;
    const objectTwo = {};
    objectTwo.name = getGlobal().name;
    objectTwo.file = getGlobal().file;
    objectTwo.id = getGlobal().id;
    objectTwo.lastModifiedDate = getGlobal().lastModifiedDate;
    objectTwo.sharedWith = getGlobal().sharedWithSingle;
    objectTwo.singleFileTags = getGlobal().singleFileTags;
    objectTwo.type = getGlobal().type;
    objectTwo.uploaded = getGlobal().uploaded;
    const updatedFile = update(getGlobal().files, {$splice: [[index, 1, objectTwo]]});
    setGlobal({files: updatedFile, filteredValue: updatedFile, singleFile: object }, () => {
      // saveFullVaultCollectionTags(file);
      saveNewVaultFile();
    });
  }

export function  saveFullVaultCollectionTags(file) {
    putFile("uploads.json", JSON.stringify(getGlobal().files), {encrypt: true})
      .then(() => {
        console.log("Saved");
        saveSingleVaultFileTags(file);
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  export function saveSingleVaultFileTags(file) {
      const thisFile = file.id;
      const fullFile = thisFile + '.json';
      putFile(fullFile, JSON.stringify(getGlobal().singleFile), {encrypt:true})
        .then(() => {
          console.log("Saved tags");
          setGlobal({ loading: false });
          loadFilesCollection();
        })
        .catch(e => {
          console.log("e");
          console.log(e);
        });
    }

export function applyVaultFilter() {
    setGlobal({ applyFilter: false });
    setTimeout(filterVaultNow, 500);
  }

export function filterVaultNow() {
    console.log(getGlobal().selectedCollab);
    console.log(getGlobal().files);
    let files = getGlobal().files;
    if(getGlobal().selectedTag !== "") {
      let tagFilter = files.filter(x => typeof x.singleFileTags !== 'undefined' ? x.singleFileTags.includes(getGlobal().selectedTag) : null);
      // let tagFilter = files.filter(x => x.tags.includes(getGlobal().selectedTag));
      setGlobal({ filteredVault: tagFilter, appliedFilter: true});
    } else if (getGlobal().selectedDate !== "") {
      let definedDate = files.filter((val) => { return val.uploaded !==undefined });
      console.log(definedDate);
      let dateFilter = definedDate.filter(x => x.uploaded.includes(getGlobal().selectedDate));
      setGlobal({ filteredVault: dateFilter, appliedFilter: true});
    } else if (getGlobal().selectedCollab !== "") {
      let collaboratorFilter = files.filter(x => typeof x.sharedWith !== 'undefined' ? x.sharedWith.includes(getGlobal().selectedCollab) : null);
      // let collaboratorFilter = files.filter(x => x.sharedWith.includes(getGlobal().selectedCollab));
      setGlobal({ filteredVault: collaboratorFilter, appliedFilter: true});
    } else if(getGlobal().selectedType) {
      let typeFilter = files.filter(x => x.type.includes(getGlobal().selectedType));
      setGlobal({ filteredVault: typeFilter, appliedFilter: true});
    }
  }

export function clearVaultFilter() {
  setGlobal({ appliedFilter: false, filteredVault: getGlobal().files });
}
export function deleteVaultTag(props) {
    setGlobal({ deleteState: false, selectedTagId: props });

    let tags = getGlobal().singleFileTags;
    const thisTag = tags.find((tag) => { return tag === props}); //this is comparing strings
    let index = thisTag;
    function findObjectIndex(tag) {
        return tag === index; //this is comparing numbers
    }
    setGlobal({ tagIndex: tags.findIndex(findObjectIndex) }, () => {
      const updatedTags = update(getGlobal().singleFileTags, {$splice: [[getGlobal().tagIndex, 1]]});
      setGlobal({singleFileTags: updatedTags });
    });
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
