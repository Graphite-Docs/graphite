import {
  getFile,
  putFile,
  loadUserData,
  encryptContent
} from 'blockstack';
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

export function loadSingleVaultFile() {
  this.setState({ loading: true });
  getFile(window.location.href.split('vault/')[1]+ ".json", { decrypt: true })
    .then(file => {
      this.setState({
        file: JSON.parse(file || "{}"),
        name: JSON.parse(file || "{}").name,
        lastModifiedDate: JSON.parse(file || "{}").lastModifiedDate,
        size: JSON.parse(file || "{}").size,
        link: JSON.parse(file || "{}").link,
        type: JSON.parse(file || "{}").type,
        sharedWith: JSON.parse(file || "{}").sharedWith,
        tags: JSON.parse(file || "{}").tags
      });
      if (this.state.type.includes("word")) {
        abuf4 = str2ab(this.state.link);
        mammoth
          .convertToHtml({ arrayBuffer: abuf4 })
          .then(result => {
            var html = result.value; // The generated HTML
            this.setState({ content: html });
            console.log(this.state.content);
            this.setState({ loading: false });
          })
          .done();
      }

      else if (this.state.type.includes("rtf")) {
        let base64 = this.state.link.split("data:text/rtf;base64,")[1];
        rtfToHTML.fromString(window.atob(base64), (err, html) => {
          console.log(window.atob(base64));
          console.log(html)
          let htmlFixed = html.replace("body", ".noclass");
          this.setState({ content:  htmlFixed});
          this.setState({ loading: "hide", show: "" });
        })
      }

      else if (this.state.type.includes("text/plain")) {
        let base64 = this.state.link.split("data:text/plain;base64,")[1];
        this.setState({ loading: "hide", show: "" });
        this.setState({ content: window.atob(base64) });
      }

      else if (this.state.type.includes("sheet")) {
        abuf4 = str2ab(this.state.link);
        var wb = XLSX.read(abuf4, { type: "buffer" });
        var first_worksheet = wb.Sheets[wb.SheetNames[0]];
        var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
        this.setState({ grid: data });
        this.setState({ loading: "hide", show: "" });
      }

      else if (this.state.type.includes("csv")) {
        let base64 = this.state.link.split("data:text/csv;base64,")[1];
        this.setState({ grid: Papa.parse(window.atob(base64)).data });
        this.setState({ loading: "hide", show: "" });
      }

      else {
        this.setState({ loading: false });
      }
    })
    .then(() => {
      this.setState({ loading: false });
    })
    .catch(error => {
      console.log(error);
    });

   let files = this.state.files;
   const thisFile = files.find((file) => { return file.id.toString() === window.location.href.split('vault/')[1]}); //this is comparing strings
   console.log("SingleVaultFile - componentDidMount - thisFile is: ", thisFile);
   let index = thisFile && thisFile.id;
   console.log("SingleVaultFile - componentDidMount - index is: ", index);
   function findObjectIndex(file) {
       return file.id === index; //this is comparing numbers
   }
   this.setState({ index: files.findIndex(findObjectIndex) })


}

export function onDocumentComplete(pages) {
  this.setState({ page: 1, pages });
}

export function onPageComplete(page) {
  this.setState({ page });
}

export function handlePrevious (props){
  this.setState({ page: props })
}

export function handleNext() {
  this.setState({ page: this.state.page + 1 });
}

export function downloadPDF() {
  var dlnk = document.getElementById("dwnldLnk");
  dlnk.href = this.state.link;
  console.log(dlnk);
  dlnk.click();
}

export function handleToDocs() {
  this.setState({ loading: true });
  getFile("documentscollection.json", { decrypt: true })
    .then(fileContents => {
      if(fileContents) {
        if(JSON.parse(fileContents).value) {
          this.setState({ value: JSON.parse(fileContents || "{}").value });
        } else {
          this.setState({ value: [] });
        }
      } else {
        this.setState({ value: []})
        console.log("No docs");
      }
    })
    .then(() => {
      this.handleAddToDocsTwo();
    })
    .catch(error => {
      console.log(error);
    });
}

export function handleAddToDocsTwo() {
  this.setState({ show: "hide" });
  this.setState({ hideButton: "hide"});
  const rando = Date.now();
  const object = {};
  object.title = this.state.name;
  object.content = this.state.content;
  object.id = rando;
  object.created = getMonthDayYear();
  object.fileType = "vault";
  const objectTwo = {}
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.created = object.created;
  objectTwo.content = object.content;
  objectTwo.fileType = "vault";

  this.setState({ value: [...this.state.value, object], singleDoc: objectTwo }, () => {
    this.saveToDocs();
  });
}

export function handleaddSheet() {
    this.setState({ loading: true });
    getFile("sheetscollection.json", { decrypt: true })
      .then(fileContents => {
        if(JSON.parse(fileContents).sheets) {
          this.setState({ sheets: JSON.parse(fileContents || "{}").sheets });
        } else {
          this.setState({ sheets: [] });
        }
      })
      .then(() => {
        this.handleaddTwoSheet();
      })
      .catch(error => {
        console.log(error);
        this.setState({ loading: false })
        alert("Trouble adding sheet");
      });
  }

export function handleaddTwoSheet() {
  this.setState({ show: "hide" });
  this.setState({ hideButton: "hide"});
  this.analyticsRun('sheets');
  const rando = Date.now();
  const object = {};
  object.title = this.state.name;
  object.content = this.state.grid;
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
  this.setState({
    sheets: [...this.state.sheets, objectTwo],
    filteredSheets: [...this.state.filteredSheets, objectTwo],
    tempSheetId: object.id,
    singleSheet: object
  }, () => {
    console.log("adding new sheet");
    this.saveToSheets();
  })
}

export function saveToDocs() {
    putFile("documentscollection.json", JSON.stringify(this.state), { encrypt: true })
      .then(() => {
        console.log("Saved!");
        this.saveToDocsTwo();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }
export function saveToDocsTwo() {
    let singleDoc = this.state.singleDoc;
    const id = singleDoc.id;
    const fullFile = '/documents/' + id + '.json'
    putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
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
    putFile("sheetscollection.json", JSON.stringify(this.state), { encrypt: true })
      .then(() => {
        console.log("Saved!");
        this.saveToSheetsTwo();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

export function saveToSheetsTwo() {
  const file = this.state.tempSheetId;
  const fullFile = '/sheets/' + file + '.json'
  putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt:true})
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
  this.setState({
    shareModal: ""
  });
}

export function sharedInfo(){
  this.setState({ confirmAdd: false });
  const user = this.state.receiverID;
  // const userShort = user.slice(0, -3);
  // const fileName = 'sharedvault.json'
  // const file = userShort + fileName;
  const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

  getFile('key.json', options)
    .then((file) => {
      this.setState({ pubKey: JSON.parse(file)})
      console.log("Step One: PubKey Loaded");
    })
      .then(() => {
        this.loadMyFile();
      })
      .catch(error => {
        console.log("No key: " + error);
        window.Materialize.toast(this.state.receiverID + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
        this.setState({ shareModal: "hide", loading: "hide", show: "" });
      });
}

export function loadMyFile() {
  const user = this.state.receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'sharedvault.json'
  const file = userShort + fileName;
  // const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}



  getFile(file, {decrypt: true})
   .then((fileContents) => {
      this.setState({ shareFileIndex: JSON.parse(fileContents || '{}') })
      console.log("Step Two: Loaded share file");
      this.setState({ loading: "", show: "hide" });
      const object = {};
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      object.uploaded = month + '/' + day + '/' + year;
      object.file = file;
      object.link = this.state.link;
      object.name = this.state.name;
      object.size = this.state.size;
      object.type = this.state.type;
      object.lastModified = this.state.lastModified;
      object.lastModifiedDate = this.state.lastModifiedDate;
      object.id = Date.now();
      this.setState({ shareFile: object, shareFileIndex: [...this.state.shareFileIndex, object] });
      setTimeout(this.shareFile, 700);
   })
    .catch(error => {
      console.log(error);
      console.log("Step Two: No share file yet, moving on");
      this.setState({ loading: "", show: "hide" });
      const object = {};
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      object.uploaded = month + '/' + day + '/' + year;
      object.file = file;
      object.link = this.state.link;
      object.name = file.name;
      object.size = file.size;
      object.type = file.type;
      object.lastModified = file.lastModified;
      object.lastModifiedDate = file.lastModifiedDate;
      object.id = Date.now();
      this.setState({ shareFile: object, shareFileIndex: [...this.state.shareFileIndex, object] });
      setTimeout(this.shareFile, 700);
    });
}

export function hideModal() {
  this.setState({
    shareModal: "hide"
  });
}

export function shareFile() {
  const user = this.state.receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'sharedvault.json'
  const file = userShort + fileName;
  putFile(file, JSON.stringify(this.state.shareFileIndex), {encrypt: true})
    .then(() => {
      console.log("Step Three: File Shared: " + this.state.shareFileIndex);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
    putFile(userShort + this.props.match.params.id + '.json', JSON.stringify(this.state.shareFile), {encrypt: true})
      .then(() => {
        console.log(userShort + this.props.match.params.id + '.json')
        // console.log("Step Four: File Shared: " + this.state.shareFile);
        this.setState({ shareModal: "hide", loading: "hide", show: "" });
        window.Materialize.toast('File shared with ' + this.state.receiverID, 4000);
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
    const publicKey = this.state.pubKey;
    const data = this.state.shareFileIndex;
    const dataTwo = this.state.shareFile;
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
        this.handleaddItem();
      })
      .catch(e => {
        console.log(e);
      });
}

export function signWithBlockusign(fileId) {
  this.setState({ loading: true });
  const options = { username: loadUserData().username, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false, app: 'https://blockusign.co'}
  getFile('key.json', options)
    .then((file) => {
      console.log(file)
      const data = JSON.stringify(this.state.file);
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
