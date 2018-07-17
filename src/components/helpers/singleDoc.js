import {
  getFile,
  putFile,
  loadUserData,
} from 'blockstack'
import update from 'immutability-helper';
import RemoteStorage from 'remotestoragejs';
import Widget from 'remotestorage-widget';
const remoteStorage = new RemoteStorage({logging: false});
const widget = new Widget(remoteStorage);
const { encryptECIES } = require('blockstack/lib/encryption');
const wordcount = require("wordcount");
const { getPublicKeyFromPrivate } = require('blockstack');

export function handleAutoSave(e) {
  this.setState({ content: e.target.value });
  clearTimeout(this.timeout);
  this.timeout = setTimeout(this.handleAutoAdd, 1500)
}

export function sharePublicly() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const object = {};
  object.title = this.state.title;
  object.content = this.state.content;
  object.words = wordcount(this.state.content);
  object.shared = month + "/" + day + "/" + year;
  this.setState({singlePublic: object, singleDocIsPublic: true})
  setTimeout(this.savePublic, 700);
}

export function stopSharing() {
  this.setState({ singlePublic: {}})
  setTimeout(this.saveStop, 700);
}

export function saveStop() {
  const user = loadUserData().username;
  const userShort = user.slice(0, -3);
  const params = this.state.documentId;
  const directory = 'public/';
  const file = directory + userShort + params + '.json'
  putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
    .then(() => {
      window.Materialize.toast(this.state.title + " is no longer publicly shared.", 4000);
    })
    .catch(e => {
      console.log("e");
      console.log(e);

    });
}

export function savePublic() {
  const user = loadUserData().username;
  // const userShort = user.slice(0, -3);
  const id = this.state.documentId
  const link = 'https://app.graphitedocs.com/shared/docs/' + user + '-' + id;
  console.log(link);
  const params = this.state.documentId;
  const directory = 'public/';
  const file = directory + id + '.json'
  putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
    .then(() => {
      console.log("Shared Public Link")
      this.setState({gaiaLink: link, publicShare: "", shareModal: "hide"});
      window.$('#publicShare').modal('open');
    })
    .catch(e => {
      console.log("e");
      console.log(e);

    });
}

export function copyLink() {
  var copyText = document.getElementById("gaia");
  copyText.select();
  document.execCommand("Copy");
  window.Materialize.toast("Link copied to clipboard", 1000);
}

export function sharedInfoSingleDoc(props){
  this.setState({ receiverID: props });
  const user = props;
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
  const fileName = 'shareddocs.json'
  const file = userShort + fileName;

  getFile(file, {decrypt: true})
   .then((fileContents) => {
      this.setState({ shareFile: JSON.parse(fileContents || '{}') })
      console.log("Step Two: Loaded share file");
      this.setState({ loading: "", show: "hide" });
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const object = {};
      object.title = this.state.title;
      object.content = this.state.content;
      object.id = Date.now();
      object.receiverID = this.state.receiverID;
      object.words = wordcount(this.state.content);
      object.shared = month + "/" + day + "/" + year;
      this.setState({ shareFile: [...this.state.shareFile, object], sharedWith: [...this.state.sharedWith, this.state.receiverID] });
      setTimeout(this.shareDoc, 700);
   })
    .catch(error => {
      console.log(error);
      console.log("Step Two: No share file yet, moving on");
      this.setState({ loading: "", show: "hide" });
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const object = {};
      object.title = this.state.title;
      object.content = this.state.content;
      object.id = Date.now();
      object.receiverID = this.state.receiverID;
      object.words = wordcount(this.state.content);
      object.shared = month + "/" + day + "/" + year;
      this.setState({ shareFile: [...this.state.shareFile, object] });
      setTimeout(this.shareDoc, 700);
    });
}

export function shareDoc() {
  const user = this.state.receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'shareddocs.json'
  const file = userShort + fileName;
  putFile(file, JSON.stringify(this.state.shareFile), {encrypt: true})
    .then(() => {
      console.log("Step Three: File Shared: " + file);
      this.setState({ shareModal: "hide", loading: "hide", show: "" });
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
    const publicKey = this.state.pubKey;
    const data = this.state.shareFile;
    const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
    const directory = '/shared/' + file;
    putFile(directory, encryptedData, {encrypt: false})
      .then(() => {
        console.log("Shared encrypted file ");
        window.Materialize.toast('Document shared with ' + this.state.receiverID, 4000);
      })
      .catch(e => {
        console.log(e);
      });
    putFile(this.state.documentId + 'sharedwith.json', JSON.stringify(this.state.sharedWith), {encrypt: true})
      .then(() => {
        console.log("Shared With File Updated")
        this.handleAutoAdd();
      })
      .catch(e => {
        console.log(e);
      });
}

export function shareModal() {
  this.setState({
    shareModal: ""
  });
}

export function hideModal() {
  this.setState({
    shareModal: "hide",
    blogModal: "hide"
  });
}

export function handleTitleChange(e) {
  this.setState({
    title: e.target.value
  });
  clearTimeout(this.timeout);
  this.timeout = setTimeout(this.handleAutoAdd, 1500)
}
export function handleChange(value) {
    this.setState({ content: value });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.handleAutoAdd, 1500)
  }

export function handleIDChange(e) {
    this.setState({ receiverID: e.target.value })
  }

export function handleBack() {
  if(this.state.autoSave === "Saving") {
    setTimeout(this.handleBack, 500);
  } else {
    window.location.replace("/documents");
  }
}

export function handleAutoAdd() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const object = {};
  object.title = this.state.title;
  object.content = this.state.content;
  object.id = parseInt(this.state.documentId, 10);
  object.updated = month + "/" + day + "/" + year;
  object.sharedWith = this.state.sharedWith;
  object.author = loadUserData().username;
  object.singleDocIsPublic = this.state.singleDocIsPublic;
  object.words = wordcount(this.state.content);
  object.tags = this.state.tags;
  object.fileType = "documents";
  this.setState({singleDoc: object});
  this.setState({autoSave: "Saving..."});
  const objectTwo = {};
  objectTwo.title = this.state.title;
  objectTwo.id = parseInt(this.state.documentId, 10);
  objectTwo.updated = month + "/" + day + "/" + year;
  objectTwo.words = wordcount(this.state.content);
  objectTwo.sharedWith = this.state.sharedWith;
  objectTwo.author = loadUserData().username;
  object.singleDocIsPublic = this.state.singleDocIsPublic;
  objectTwo.tags = this.state.tags;
  objectTwo.fileType = "documents";
  const index = this.state.index;
  const updatedDoc = update(this.state.value, {$splice: [[index, 1, objectTwo]]});
  this.setState({value: updatedDoc});
  setTimeout(this.autoSave, 300);
  if (this.state.singleDocIsPublic === true) {
  setTimeout(this.sharePublicly, 300)
  }
};

export function autoSave() {
  console.log("trying to save")
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const file = this.state.documentId;
  const fullFile = '/documents/' + file + '.json';
  function lengthInUtf8Bytes(str) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
  }
  console.log(lengthInUtf8Bytes(this.state.singleDoc))
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt: true})
    .then(() => {
      console.log("Autosaved");
      this.saveSingleDocCollection();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
    remoteStorage.access.claim(this.state.documentId, 'rw');
    remoteStorage.caching.enable('/' + this.state.documentId + '/');
    const client = remoteStorage.scope('/' + this.state.documentId + '/');
    const content = this.state.content;
    const title = this.state.title;
    const words = wordcount(this.state.content);
    const updated = month + "/" + day + "/" + year;
    const id = parseInt(this.state.documentId, 10);
    const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    client.storeFile('text/plain', 'content.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(content))))
    .then(() => { console.log("Upload done") });
    client.storeFile('text/plain', 'title.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(title))))
    .then(() => { console.log("Upload done") });
    client.storeFile('text/plain', 'wordCount.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(words))))
    .then(() => { console.log("Upload done") });
    client.storeFile('text/plain', 'updated.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(updated))))
    .then(() => { console.log("Upload done") });
    client.storeFile('text/plain', 'id.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(id))))
    .then(() => { console.log("Upload done") });
}

export function saveSingleDocCollection() {
  putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
    .then(() => {
      this.setState({autoSave: "Saved"});
      if(this.state.stealthyConnected) {
        setTimeout(this.connectStealthy, 300);
      } else if(this.state.travelstackConnected) {
        setTimeout(this.connectTravelstack, 300);
      } else if (this.state.coinsConnected) {
        setTimeout(this.connectCoins, 300);
      }

      // this.saveDocsStealthy();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function componentDidMountData(props) {
  window.$('.summernote').summernote({
      placeholder: "Write something great",
      value: this.state.content,
      onChange: this.handleChange,
      id: props
    });

    window.$(".summernote").on("summernote.change", function (e) {   // callback as jquery custom event
      this.setState({ content: e.target.value });
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.handleAutoAdd, 1500)
    }.bind(this));


  const thisFile = props;
  const fullFile = '/documents/' + thisFile + '.json';
  this.setState({ documentId: props });

  getFile(props + 'sharedwith.json', {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       this.setState({ sharedWith: JSON.parse(fileContents || '{}') })
     } else {
       this.setState({ sharedWith: [] })
     }
   })
    .catch(error => {
      console.log("shared with doc error: ")
      console.log(error);
    });

  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
      this.setState({ value: JSON.parse(fileContents || '{}').value })
      let value = this.state.value;
      const thisDoc = value.find((doc) => { return doc.id == props});
      let index = thisDoc && thisDoc.id;
      console.log(index);
      function findObjectIndex(doc) {
          return doc.id == index;
      }
      this.setState({index: value.findIndex(findObjectIndex)})
   })
    .catch(error => {
      console.log(error);
    });

getFile(fullFile, {decrypt: true})
 .then((fileContents) => {
   console.log(JSON.parse(fileContents || '{}'));
    this.setState({
      title: JSON.parse(fileContents || '{}').title,
      content: JSON.parse(fileContents || '{}').content,
      tags: JSON.parse(fileContents || '{}').tags,
      singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic,
      idToLoad: JSON.parse(fileContents || '{}').id,
      docLoaded: true
   })
 })
 .then(() => {
   let markupStr = this.state.content;
   if(markupStr !=="") {
     window.$('.summernote').summernote('code', markupStr);
   }
 })
  .catch(error => {
    console.log(error);
  });
}

export function handleStealthy() {
  this.setState({hideStealthy: !this.state.hideStealthy})
}

export function print(){
    window.print();
}
