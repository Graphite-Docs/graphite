import {
  getFile,
  putFile,
  loadUserData,
  encryptContent, 
  decryptContent
} from 'blockstack';
import { fetchFromProvider } from './storageProviders/fetch';
import { setGlobal, getGlobal } from 'reactn';
import { handleaddItem } from './documents';
import {
  getMonthDayYear
} from './getMonthDayYear';
import XLSX from "xlsx";
const mammoth = require("mammoth");
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('../vault/rtf-to-html.js');
const Papa = require('papaparse');
const { encryptECIES, } = require('blockstack/lib/encryption');
let abuf4;

export async function loadSingleVaultFile(props) {
  console.log("here we go")
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  let fileName;
  if(props) {
    fileName = props + ".json"
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
    const params = {
      provider: storageProvider,
      token: token,
      filePath: `/vault/${fileName}`
    };
    //Call fetchFromProvider and wait for response.
    let fetchFile = await fetchFromProvider(params);
    console.log(fetchFile)
    if(fetchFile) {
      if(fetchFile.loadLocal) {
        console.log("Loading local instance first");
        const decryptedContent = await JSON.parse(decryptContent(JSON.parse(fetchFile.data.content), { privateKey: thisKey }))
        await setGlobal({ 
          file: decryptedContent,
          name: decryptedContent.name,
          lastModifiedDate: decryptedContent.lastModifiedDate,
          size: decryptedContent.size,
          link: decryptedContent.link,
          type: decryptedContent.type,
          sharedWith: decryptedContent.sharedWith,
          tags: decryptedContent.tags,
          publicVaultFile: decryptedContent.publicVaultFile || false
        })
      } else {
        //check if there is no file to load and set state appropriately.
        if(typeof fetchFile === 'string') {
          console.log("Nothing stored locally or in storage provider.")
          if(fetchFile.includes('error')) {
            console.log("Setting state appropriately")
            await setGlobal({
              shareFile: []
            })
          }
        } else {
          //No indexedDB data found, so we load and read from the API call.
          //Load up a new file reader and convert response to JSON.
          const reader = await new FileReader();
          var blob = fetchFile.fileBlob;
          reader.onloadend = async (evt) => {
            console.log("read success");
            const decryptedContent = await JSON.parse(decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey }))
            await setGlobal({ 
              file: decryptedContent,
              name: decryptedContent.name,
              lastModifiedDate: decryptedContent.lastModifiedDate,
              size: decryptedContent.size,
              link: decryptedContent.link,
              type: decryptedContent.type,
              sharedWith: decryptedContent.sharedWith,
              tags: decryptedContent.tags,
              publicVaultFile: decryptedContent.publicVaultFile || false
            })
          };
          await console.log(reader.readAsText(blob));
        }
      }
    } else {
      getFile(fileName, { decrypt: true })
      .then(file => {
        console.log(JSON.parse(file))
        setGlobal({
          file: JSON.parse(file || "{}"),
          name: JSON.parse(file || "{}").name,
          lastModifiedDate: JSON.parse(file || "{}").lastModifiedDate,
          size: JSON.parse(file || "{}").size,
          link: JSON.parse(file || "{}").link,
          type: JSON.parse(file || "{}").type,
          sharedWith: JSON.parse(file || "{}").sharedWith,
          tags: JSON.parse(file || "{}").tags,
          publicVaultFile: JSON.parse(file).publicVaultFile || false
        });
      })
      .then(() => {
        console.log(getGlobal().link);
      })
      .catch(error => {
        console.log(error);
      });
    }
  }
  } else {
    setGlobal({ loading: true });
    fileName = window.location.href.split('vault/')[1].split('#')[0] + ".json";
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
      const params = {
        provider: storageProvider,
        token: token,
        filePath: `/vault/${fileName}`
      };
      //Call fetchFromProvider and wait for response.
      let fetchFile = await fetchFromProvider(params);
      console.log(fetchFile)
      if(fetchFile) {
        if(fetchFile.loadLocal) {
          console.log("Loading local instance first");
          const decryptedContent = await JSON.parse(decryptContent(JSON.parse(fetchFile.data.content), { privateKey: thisKey }))
          await setGlobal({ 
            file: decryptedContent,
            name: decryptedContent.name,
            lastModifiedDate: decryptedContent.lastModifiedDate,
            size: decryptedContent.size,
            link: decryptedContent.link,
            type: decryptedContent.type,
            sharedWith: decryptedContent.sharedWith,
            tags: decryptedContent.tags,
            publicVaultFile: decryptedContent.publicVaultFile || false
          })
        } else {
          //check if there is no file to load and set state appropriately.
          if(typeof fetchFile === 'string') {
            console.log("Nothing stored locally or in storage provider.")
            if(fetchFile.includes('error')) {
              console.log("Setting state appropriately")
              await setGlobal({
                shareFile: []
              })
            }
          } else {
            //No indexedDB data found, so we load and read from the API call.
            //Load up a new file reader and convert response to JSON.
            const reader = await new FileReader();
            var blob2 = fetchFile.fileBlob;
            reader.onloadend = async (evt) => {
              console.log("read success");
              const decryptedContent = await JSON.parse(decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey }))
              await setGlobal({ 
                file: decryptedContent,
                name: decryptedContent.name,
                lastModifiedDate: decryptedContent.lastModifiedDate,
                size: decryptedContent.size,
                link: decryptedContent.link,
                type: decryptedContent.type,
                sharedWith: decryptedContent.sharedWith,
                tags: decryptedContent.tags,
                publicVaultFile: decryptedContent.publicVaultFile || false
              })
            };
            await console.log(reader.readAsText(blob2));
          }
        }

        if (getGlobal().type.includes("word")) {
          abuf4 = str2ab(getGlobal().link);
          mammoth
            .convertToHtml({ arrayBuffer: abuf4 })
            .then(result => {
              var html = result.value; // The generated HTML
              setGlobal({ content: html });
              console.log(getGlobal().content);
              setGlobal({ loading: false });
            })
            .done();
        }

        else if (getGlobal().type.includes("rtf")) {
          let base64 = getGlobal().link.split("data:text/rtf;base64,")[1];
          rtfToHTML.fromString(window.atob(base64), (err, html) => {
            console.log(window.atob(base64));
            console.log(html)
            let htmlFixed = html.replace("body", ".noclass");
            setGlobal({ content:  htmlFixed});
            setGlobal({ loading: "hide", show: "" });
          })
        }

        else if (getGlobal().type.includes("text/plain")) {
          let base64 = getGlobal().link.split("data:text/plain;base64,")[1];
          setGlobal({ loading: "hide", show: "" });
          setGlobal({ content: window.atob(base64) });
        }

        else if (getGlobal().type.includes("sheet")) {
          abuf4 = str2ab(getGlobal().link);
          var wb = XLSX.read(abuf4, { type: "buffer" });
          var first_worksheet = wb.Sheets[wb.SheetNames[0]];
          var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
          setGlobal({ grid: data });
          setGlobal({ loading: "hide", show: "" });
        }

        else if (getGlobal().type.includes("csv")) {
          let base64 = getGlobal().link.split("data:text/csv;base64,")[1];
          setGlobal({ grid: Papa.parse(window.atob(base64)).data });
          setGlobal({ loading: "hide", show: "" });
        }

        else {
          setGlobal({ loading: false });
        }
      }
    } else {
      getFile(fileName, { decrypt: true })
      .then(file => {
        console.log(JSON.parse(file))
        setGlobal({
          file: JSON.parse(file || "{}"),
          name: JSON.parse(file || "{}").name,
          lastModifiedDate: JSON.parse(file || "{}").lastModifiedDate,
          size: JSON.parse(file || "{}").size,
          link: JSON.parse(file || "{}").link,
          type: JSON.parse(file || "{}").type,
          sharedWith: JSON.parse(file || "{}").sharedWith,
          tags: JSON.parse(file || "{}").tags,
          publicVaultFile: JSON.parse(file).publicVaultFile || false
        });
        if (getGlobal().type.includes("word")) {
          abuf4 = str2ab(getGlobal().link);
          mammoth
            .convertToHtml({ arrayBuffer: abuf4 })
            .then(result => {
              var html = result.value; // The generated HTML
              setGlobal({ content: html });
              console.log(getGlobal().content);
              setGlobal({ loading: false });
            })
            .done();
        }

        else if (getGlobal().type.includes("rtf")) {
          let base64 = getGlobal().link.split("data:text/rtf;base64,")[1];
          rtfToHTML.fromString(window.atob(base64), (err, html) => {
            console.log(window.atob(base64));
            console.log(html)
            let htmlFixed = html.replace("body", ".noclass");
            setGlobal({ content:  htmlFixed});
            setGlobal({ loading: "hide", show: "" });
          })
        }

        else if (getGlobal().type.includes("text/plain")) {
          let base64 = getGlobal().link.split("data:text/plain;base64,")[1];
          setGlobal({ loading: "hide", show: "" });
          setGlobal({ content: window.atob(base64) });
        }

        else if (getGlobal().type.includes("sheet")) {
          abuf4 = str2ab(getGlobal().link);
          var wb = XLSX.read(abuf4, { type: "buffer" });
          var first_worksheet = wb.Sheets[wb.SheetNames[0]];
          var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
          setGlobal({ grid: data });
          setGlobal({ loading: "hide", show: "" });
        }

        else if (getGlobal().type.includes("csv")) {
          let base64 = getGlobal().link.split("data:text/csv;base64,")[1];
          setGlobal({ grid: Papa.parse(window.atob(base64)).data });
          setGlobal({ loading: "hide", show: "" });
        }

        else {
          setGlobal({ loading: false });
        }
      })
      .then(() => {
        setGlobal({ loading: false });
      })
      .catch(error => {
        console.log(error);
      });
    }
    

     let files = getGlobal().files;
     const thisFile = files.find((file) => { return file.id.toString() === window.location.href.split('vault/')[1].split('#')[0]}); //this is comparing strings
     console.log("SingleVaultFile - componentDidMount - thisFile is: ", thisFile);
     let index = thisFile && thisFile.id;
     console.log("SingleVaultFile - componentDidMount - index is: ", index);
     function findObjectIndex(file) {
         return file.id === index; //this is comparing numbers
     }
     setGlobal({ index: files.findIndex(findObjectIndex) })
  }
}

export function onDocumentComplete(pages) {
  setGlobal({ page: 1, pages });
}

export function onPageComplete(page) {
  setGlobal({ page });
}

export function handlePrevious (props){
  setGlobal({ page: props })
}

export function handleNext() {
  setGlobal({ page: getGlobal().page + 1 });
}

export function downloadPDF() {
  var dlnk = document.getElementById("dwnldLnk");
  dlnk.href = getGlobal().link;
  console.log(dlnk);
  dlnk.click();
}

export function handleToDocs() {
  setGlobal({ loading: true });
  getFile("documentscollection.json", { decrypt: true })
    .then(fileContents => {
      if(JSON.parse(fileContents)) {
        if(JSON.parse(fileContents).value) {
          setGlobal({ value: JSON.parse(fileContents || "{}").value });
        } else {
          setGlobal({ value: JSON.parse(fileContents || "{}") });
        }
      } else {
        setGlobal({ value: []})
        console.log("No docs");
      }
    })
    .then(() => {
      handleAddToDocsTwo();
    })
    .catch(error => {
      console.log(error);
    });
}

export function handleAddToDocsTwo() {
  setGlobal({ show: "hide" });
  setGlobal({ hideButton: "hide"});
  const rando = Date.now();
  const object = {};
  object.title = getGlobal().name;
  object.content = getGlobal().content;
  object.id = rando;
  object.created = getMonthDayYear();
  object.fileType = "vault";
  const objectTwo = {}
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.created = object.created;
  objectTwo.content = object.content;
  objectTwo.fileType = "vault";

  setGlobal({ value: [...getGlobal().value, object], singleDoc: objectTwo }, () => {
    saveToDocs();
  });
}

export function handleaddSheet() {
    setGlobal({ loading: true });
    getFile("sheetscollection.json", { decrypt: true })
      .then(fileContents => {
        if(JSON.parse(fileContents).sheets) {
          setGlobal({ sheets: JSON.parse(fileContents || "{}").sheets });
        } else {
          setGlobal({ sheets: [] });
        }
      })
      .then(() => {
        handleaddTwoSheet();
      })
      .catch(error => {
        console.log(error);
        setGlobal({ loading: false })
        alert("Trouble adding sheet");
      });
  }

export function handleaddTwoSheet() {
  setGlobal({ show: "hide" });
  setGlobal({ hideButton: "hide"});
  // analyticsRun('sheets');
  const rando = Date.now();
  const object = {};
  object.title = getGlobal().name;
  object.content = getGlobal().grid;
  object.id = rando;
  object.created = getMonthDayYear();
  object.sharedWith = [];
  object.tags = [];
  const objectTwo = {};
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.created = object.created
  objectTwo.sharedWith = [];
  objectTwo.tags = [];
  objectTwo.lastUpdate = Date.now();
  setGlobal({
    sheets: [...getGlobal().sheets, objectTwo],
    filteredSheets: [...getGlobal().filteredSheets, objectTwo],
    tempSheetId: object.id,
    singleSheet: object
  }, () => {
    console.log("adding new sheet");
    saveToSheets();
  })
}

export function saveToDocs() {
    putFile("documentscollection.json", JSON.stringify(getGlobal().value), { encrypt: true })
      .then(() => {
        console.log("Saved!");
        saveToDocsTwo();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }
export function saveToDocsTwo() {
    let singleDoc = getGlobal().singleDoc;
    const id = singleDoc.id;
    const fullFile = '/documents/' + id + '.json'
    putFile(fullFile, JSON.stringify(getGlobal().singleDoc), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        window.location.replace("/documents");
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

export function saveToSheets() {
    putFile("sheetscollection.json", JSON.stringify(getGlobal()), { encrypt: true })
      .then(() => {
        console.log("Saved!");
        saveToSheetsTwo();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

export function saveToSheetsTwo() {
  const file = getGlobal().tempSheetId;
  const fullFile = '/sheets/' + file + '.json'
  putFile(fullFile, JSON.stringify(getGlobal().singleSheet), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      window.location.replace("/sheets");
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

///sharing

export function shareModal() {
  setGlobal({
    shareModal: ""
  });
}

export function sharedInfo(){
  setGlobal({ confirmAdd: false });
  const user = getGlobal().receiverID;
  // const userShort = user.slice(0, -3);
  // const fileName = 'sharedvault.json'
  // const file = userShort + fileName;
  const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

  getFile('key.json', options)
    .then((file) => {
      setGlobal({ pubKey: JSON.parse(file)})
      console.log("Step One: PubKey Loaded");
    })
      .then(() => {
        loadMyFile();
      })
      .catch(error => {
        console.log("No key: " + error);
        window.Materialize.toast(getGlobal().receiverID + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
        setGlobal({ shareModal: "hide", loading: "hide", show: "" });
      });
}

export function loadMyFile() {
  const user = getGlobal().receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'sharedvault.json'
  const file = userShort + fileName;
  // const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}



  getFile(file, {decrypt: true})
   .then((fileContents) => {
      setGlobal({ shareFileIndex: JSON.parse(fileContents || '{}') })
      console.log("Step Two: Loaded share file");
      setGlobal({ loading: "", show: "hide" });
      const object = {};
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      object.uploaded = month + '/' + day + '/' + year;
      object.file = file;
      object.link = getGlobal().link;
      object.name = getGlobal().name;
      object.size = getGlobal().size;
      object.type = getGlobal().type;
      object.lastModified = getGlobal().lastModified;
      object.lastModifiedDate = getGlobal().lastModifiedDate;
      object.id = Date.now();
      setGlobal({ shareFile: object, shareFileIndex: [...getGlobal().shareFileIndex, object] });
      setTimeout(shareFile, 700);
   })
    .catch(error => {
      console.log(error);
      console.log("Step Two: No share file yet, moving on");
      setGlobal({ loading: "", show: "hide" });
      const object = {};
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      object.uploaded = month + '/' + day + '/' + year;
      object.file = file;
      object.link = getGlobal().link;
      object.name = file.name;
      object.size = file.size;
      object.type = file.type;
      object.lastModified = file.lastModified;
      object.lastModifiedDate = file.lastModifiedDate;
      object.id = Date.now();
      setGlobal({ shareFile: object, shareFileIndex: [...getGlobal().shareFileIndex, object] });
      setTimeout(shareFile, 700);
    });
}

export function hideModal() {
  setGlobal({
    shareModal: "hide"
  });
}

export function shareFile() {
  const user = getGlobal().receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'sharedvault.json'
  const file = userShort + fileName;
  putFile(file, JSON.stringify(getGlobal().shareFileIndex), {encrypt: true})
    .then(() => {
      console.log("Step Three: File Shared: " + getGlobal().shareFileIndex);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
    //TODO: need to replace the match param with a window reference.
    putFile(userShort + this.props.match.params.id + '.json', JSON.stringify(getGlobal().shareFile), {encrypt: true})
      .then(() => {
        console.log(userShort + this.props.match.params.id + '.json')
        // console.log("Step Four: File Shared: " + getGlobal().shareFile);
        setGlobal({ shareModal: "hide", loading: "hide", show: "" });
        window.Materialize.toast('File shared with ' + getGlobal().receiverID, 4000);
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
    const publicKey = getGlobal().pubKey;
    const data = getGlobal().shareFileIndex;
    const dataTwo = getGlobal().shareFile;
    const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
    const encryptedDataTwo = JSON.stringify(encryptECIES(publicKey, JSON.stringify(dataTwo)));
    const directory = '/shared/' + file;
    putFile(directory, encryptedData, {encrypt: false})
      .then(() => {

        console.log("Shared encrypted fileIndex" + directory);
      })
      .catch(e => {
        console.log(e);
      });
    putFile('/shared/' + userShort + this.props.match.params.id + '.json', encryptedDataTwo, {encrypt: false})
      .then(() => {
        console.log("Shared encrypted file");
        console.log(dataTwo);
        handleaddItem();
      })
      .catch(e => {
        console.log(e);
      });
}

export function signWithBlockusign(fileId) {
  setGlobal({ loading: true });
  const options = { username: loadUserData().username, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false, app: 'https://blockusign.co'}
  getFile('key.json', options)
    .then((file) => {
      console.log(file)
      const data = JSON.stringify(getGlobal().file);
      console.log(data)
      const encryptedData = encryptContent(data, {publicKey: file})
      putFile('blockusign/' + fileId, encryptedData, {encrypt: false})
        .then(() => {
          let id = 'blockusign/' + fileId;
          window.location.replace('https://blockusign.co/#/graphite?username=' + loadUserData().username + '?fileId=' + id + '?appUrl=' + window.location.origin)
        }).catch(error => {
          console.log(error)
        })
    })
}

export function shareVaultFile() {
  let fileName = 'public/vault/' + window.location.href.split('vault/')[1];
  const object = {};
  object.file = getGlobal().file;
  object.uploaded = getGlobal().lastModifiedDate;
  object.link = getGlobal().link;
  object.name = getGlobal().name;
  object.size = getGlobal().size;
  object.type = getGlobal().type;
  object.tags = getGlobal().tags;
  object.sharedWith = getGlobal().sharedWith;
  object.lastModifiedDate = getGlobal().lastModifiedDate;
  object.id = window.location.href.split('vault/')[1];
  object.vault = "vault";
  object.publicVaultFile = true;
  setGlobal({ singleVaultFile: object, publicVaultFile: true }, () => {
    putFile(fileName, JSON.stringify(getGlobal().singleVaultFile), {encrypt: false})
      .then(() => {
        console.log('Saved: ' + window.location.origin + '/public/' + loadUserData().username + '/' + window.location.href.split('vault/')[1]);
        putFile(window.location.href.split('vault/')[1] + '.json', JSON.stringify(getGlobal().singleVaultFile), {encrypt: true})
          .then(() => {
            console.log("saved single vault file")
          })
      })
      .catch(error => console.log(error))
  })
}

export function stopSharingPubVaultFile() {
  let fileName = 'public/vault/' + window.location.href.split('vault/')[1];
  const object = {};
  object.file = getGlobal().file;
  object.uploaded = getGlobal().lastModifiedDate;
  object.link = getGlobal().link;
  object.name = getGlobal().name;
  object.size = getGlobal().size;
  object.type = getGlobal().type;
  object.tags = getGlobal().tags;
  object.sharedWith = getGlobal().sharedWith;
  object.lastModifiedDate = getGlobal().lastModifiedDate;
  object.id = window.location.href.split('vault/')[1];
  object.vault = "vault";
  object.publicVaultFile = false;
  setGlobal({ singleVaultFile: object, publicVaultFile: false }, () => {
    putFile(fileName, JSON.stringify({}), {encrypt: false})
      .then(() => {
        putFile(window.location.href.split('vault/')[1] + '.json', JSON.stringify(getGlobal().singleVaultFile), {encrypt: true})
          .then(() => {
            console.log("No longer sharing")
          })
      })
      .catch(error => console.log(error))
  })
}
