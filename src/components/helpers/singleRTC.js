import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import {
  getMonthDayYear
} from './getMonthDayYear';
const { decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
const lzjs = require('lzjs');

export function loadSharedRTC() {
  let userToLoadFrom = window.location.href.split('shared/')[1].split('/')[0];
  let fileString = 'shareddocs.json';
  let file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + fileString;
  const privateKey = loadUserData().appPrivateKey;
  const directory = 'shared/' + file;
  const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    getFile(directory, options)
     .then((fileContents) => {
       console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))))
        this.setState({ sharedFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
        let docs = this.state.sharedFile;
        const thisDoc = docs.find((doc) => { return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1]}); //comparing strings
        let index = thisDoc && thisDoc.id;
        console.log(thisDoc);
        function findObjectIndex(doc) {
            return doc.id === index; //comparing numbers
        }
        this.setState({ content: thisDoc && lzjs.decompress(thisDoc.content), title: thisDoc && thisDoc.title, index: docs.findIndex(findObjectIndex), rtc: thisDoc && thisDoc.rtc, docLoaded: true, idToLoad: window.location.href.split('shared/')[1].split('/')[1], tempDocId: window.location.href.split('shared/')[1].split('/')[1], teamDoc: thisDoc && thisDoc.teamDoc })
     })
     .then(() => {
       if(this.state.rtc) {
         // this.handleAddRTC();
       }
     })
      .catch(error => {
        console.log(error);
      });
}

export function findDoc() {
  getFile("documentscollection.json", {decrypt: true})
  .then((fileContents) => {
    this.setState({ value: JSON.parse(fileContents || '{}').value })
    let value = this.state.value;
    const thisDoc = value.find((doc) => {
      return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1] //this is comparing a string to a string
    });
    if(thisDoc) {
      console.log("found it")
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
        return doc.id === index; //this is comparing a number to a number
      }
      this.setState({index: value.findIndex(findObjectIndex)})
      setTimeout(this.loadSingleRTC, 300)
    } else {
      console.log("Nope")
      this.loadSharedRTC();
    }
  })
  .catch(error => {
    console.log(error);
  });
}

export function loadSingleRTC() {
  const thisFile = window.location.href.split('shared/')[1].split('/')[1];
  const fullFile = '/documents/' + thisFile + '.json';
  getFile(fullFile, {decrypt: true})
  .then((fileContents) => {
    console.log(JSON.parse(fileContents))
    this.setState({
      //NOTE: don't need author, not setting that state attribute...
      title: JSON.parse(fileContents || '{}').title,
      content: JSON.parse(fileContents || '{}').content,
      tags: JSON.parse(fileContents || '{}').tags,
      idToLoad: JSON.parse(fileContents || '{}').id,
      singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
      docLoaded: true,
      readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
      rtc: JSON.parse(fileContents || '{}').rtc || false,
      teamDoc: JSON.parse(fileContents || '{}').teamDoc
    })
  })
  .catch(error => {
    console.log(error);
  });
}

export function handleAddRTC() {
  console.warn(this.state.teamDoc);
  // const object = {};
  // object.title = this.state.title;
  // object.id = this.state.tempDocId;
  // object.updated = getMonthDayYear();
  // object.tags = [];
  // object.sharedWith = [];
  // object.rtc = this.state.rtc;
  // object.teamDoc = this.state.teamDoc;
  // const objectTwo = {}
  // objectTwo.title = object.title;
  // objectTwo.id = object.id;
  // objectTwo.updated = object.created;
  // objectTwo.content = this.state.content;
  // objectTwo.tags = [];
  // objectTwo.sharedWith = [];
  // objectTwo.rtc = this.state.rtc;
  // objectTwo.teamDoc = this.state.teamDoc;
  //
  // this.setState({ value: [...this.state.value, object] });
  // this.setState({ singleDoc: objectTwo });
  // this.setState({ action: "Team document received and added to collection"});
  // setTimeout(this.saveNewSharedFile, 500);
}

export function handleAddStatic() {
  const rando = Date.now();
  const object = {};
  object.title = this.state.title;
  object.id = rando;
  object.created = getMonthDayYear();
  const objectTwo = {}
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.created = object.created;
  objectTwo.content = this.state.content;
  this.setState({ value: [...this.state.value, object] });
  this.setState({ singleDoc: objectTwo });
  this.setState({ tempDocId: object.id });
  setTimeout(this.saveNewSharedFile, 500);

  this.setState({ show: "hide" });
  this.setState({ hideButton: "hide", loading: "" })
}

export function saveNewSharedFile() {
  putFile("documentscollection.json", JSON.stringify(this.state), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      this.saveNewSingleSharedDoc();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveNewSingleSharedDoc() {
  const file = this.state.tempDocId;
  const fullFile = '/documents/' + file + '.json'
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      if(this.state.rtc !== true) {
        window.location.replace("/documents");
      }
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  }

export function loadAllDocs() {
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       this.setState({ value: JSON.parse(fileContents || '{}').value });
     } else {
       console.log("No docs");
     }
   })
    .catch(error => {
      console.log(error);
    });
}
