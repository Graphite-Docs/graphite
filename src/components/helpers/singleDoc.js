import {
  getFile,
  putFile,
  loadUserData,
  lookupProfile
} from 'blockstack'
// import {
//   postToSlack
// } from './traditionalIntegrations'
import {
  getMonthDayYear
} from './getMonthDayYear';
import {
  html2pdf
} from 'html2pdf';
import update from 'immutability-helper';
const FileSaver = require('file-saver');
const htmlDocx = require('html-docx-js/dist/html-docx');
const lzjs = require('lzjs');
const { encryptECIES } = require('blockstack/lib/encryption');
const wordcount = require("wordcount");
// const { getPublicKeyFromPrivate } = require('blockstack');

export function initialDocLoad() {
  const thisFile = window.location.href.split('doc/')[1];
  const fullFile = '/documents/' + thisFile + '.json';

  getFile("contact.json", {decrypt: true})
  .then((fileContents) => {
    let file = JSON.parse(fileContents || '{}');
    let contacts = file.contacts;
    if(contacts.length > 0) {
      this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
    } else {
      this.setState({ contacts: [] });
    }
  })
  .catch(error => {
    console.log(error);
  });

  getFile(window.location.href.split('doc/')[1] + 'sharedwith.json', {decrypt: true})
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
    const thisDoc = value.find((doc) => {
      return doc.id.toString() === window.location.href.split('doc/')[1] //this is comparing a string to a string
    });
    let index = thisDoc && thisDoc.id;
    function findObjectIndex(doc) {
      return doc.id === index; //this is comparing a number to a number
    }
    this.setState({index: value.findIndex(findObjectIndex)})
  })
  .catch(error => {
    console.log(error);
  });

  getFile(fullFile, {decrypt: true})
  .then((fileContents) => {
    console.log(JSON.parse(fileContents));
    if(JSON.parse(fileContents).compressed === true) {
      this.setState({ content: lzjs.decompress(JSON.parse(fileContents).content)})
    } else {
      this.setState({ content: JSON.parse(fileContents).content});
    }
    this.setState({
      title: JSON.parse(fileContents || '{}').title,
      // content: JSON.parse(fileContents || '{}').content,
      tags: JSON.parse(fileContents || '{}').tags,
      idToLoad: JSON.parse(fileContents || '{}').id,
      singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
      docLoaded: true,
      readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
      rtc: JSON.parse(fileContents || '{}').rtc || false,
      sharedWith: JSON.parse(fileContents || '{}').sharedWith,
      teamDoc: JSON.parse(fileContents || '{}').teamDoc,
      compressed: JSON.parse(fileContents || '{}').compressed || false,
      spacing: JSON.parse(fileContents || '{}').spacing
    })
  //   if(JSON.parse(fileContents).rtc) {
  //     this.setState({
  //       title: JSON.parse(fileContents || '{}').title,
  //       tags: JSON.parse(fileContents || '{}').tags,
  //       idToLoad: JSON.parse(fileContents || '{}').id,
  //       singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
  //       docLoaded: true,
  //       readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
  //       rtc: JSON.parse(fileContents || '{}').rtc || false,
  //       sharedWith: JSON.parse(fileContents || '{}').sharedWith
  //     })
  //     // setTimeout(this.noCollaboration, 1000);
  //   } else {
  //     this.setState({
  //       title: JSON.parse(fileContents || '{}').title,
  //       content: JSON.parse(fileContents || '{}').content,
  //       tags: JSON.parse(fileContents || '{}').tags,
  //       idToLoad: JSON.parse(fileContents || '{}').id,
  //       singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
  //       docLoaded: true,
  //       readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
  //       rtc: JSON.parse(fileContents || '{}').rtc || false,
  //       sharedWith: JSON.parse(fileContents || '{}').sharedWith
  //     })
  //   }
  })
  .then(() => {
    this.loadAvatars();
    console.log(this.state.spacing)
    document.getElementsByClassName('ql-editor')[0].style.lineHeight = this.state.spacing;
  })
  .catch(error => {
    console.log(error);
  });
  this.printPreview = () => {
    if(this.state.printPreview === true) {
      this.setState({printPreview: false});
    } else {
      this.setState({printPreview: true});
    }
  }
}

export function noCollaboration() {
  const thisFile = window.location.href.split('doc/')[1];
  const fullFile = '/documents/' + thisFile + '.json';
  if(this.state.content === "<p><br></p>") {
    getFile(fullFile, {decrypt: true})
    .then((fileContents) => {
      this.setState({
        title: JSON.parse(fileContents || '{}').title,
        content: JSON.parse(fileContents || '{}').content,
        tags: JSON.parse(fileContents || '{}').tags,
        idToLoad: JSON.parse(fileContents || '{}').id,
        singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
        docLoaded: true,
        readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
        rtc: JSON.parse(fileContents || '{}').rtc || false,
        sharedWith: JSON.parse(fileContents || '{}').sharedWith
      })
    })
    .catch(error => {
      console.log(error)
    })
  }
}

export function loadAvatars() {
  if (this.state.sharedWith.length > 0) {
    this.state.sharedWith.forEach((name) => {
      console.log(this.state.avatars);
      lookupProfile(name, "https://core.blockstack.org/v1/names")
        .then((profile) => {
          this.setState({ avatars: [...this.state.avatars, profile]});
        })
        .catch((error) => {
          console.log('could not resolve profile')
        })
    })
  } else {
    setTimeout(this.loadAvatars, 300);
  }

}

export function stealthyChat() {
  this.setState({hideStealthy: !this.state.hideStealthy})
}

export function getYjsConnectionStatus(status) {
  this.setState({ yjsConnected: status}) //set status of yjsConnected based on connection.connected in Yjs... then if yjsConnect is true, start timer in Timer component. if not connected, don't start timer.
}

export function toggleReadOnly() { //make this function toggleReadyOnly state instead, so user can press button again!!!!
  this.setState(
    prevState => ({ readOnly: !prevState.readOnly }) //setState of readOnly to the opposite of its previous state...
  )
  setTimeout(this.sharePublicly, 700); //call sharePublicly on a slight delay, so state has updated since calling setState above...
}

export function handleAutoSave(e) {
  this.setState({ content: e.target.value });
  clearTimeout(this.timeout);
  this.timeout = setTimeout(this.handleAutoAdd, 1500)
}

export function sharePublicly() {
  this.setState({ publicShare: ""});
  const object = {};
  object.title = this.state.title;
  object.content = this.state.content;
  object.words = wordcount(this.state.content);
  object.shared = getMonthDayYear();
  object.readOnly = this.state.readOnly;
  object.singleDocIsPublic = true;
  this.setState({
    singlePublic: object,
    singleDocIsPublic: true
  })
  setTimeout(this.savePublic, 700);
}

export function stopSharing() {
  this.setState({
    singlePublic: {},
    singleDocIsPublic: false
  })
  setTimeout(this.saveStop, 700);
}

export function saveStop() {
  const params = window.location.href.split('doc/')[1];
  const directory = 'public/';
  const file = directory + params + '.json'
  putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
  .then(() => {
    window.Materialize.toast(this.state.title + " is no longer publicly shared.", 4000);
    this.handleAutoAdd();
  })
  .catch(e => {
    console.log(e);
  });
}

export function savePublic() {
  const user = loadUserData().username;
  const id = window.location.href.split('doc/')[1];
  const link = window.location.origin + '/shared/docs/' + user + '-' + id;
  const directory = 'public/';
  const file = directory + id + '.json';
  putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
  .then(() => {
    this.setState({gaiaLink: link, publicShare: "", shareModal: "hide"});
    this.handleAutoAdd() //call this every time savePublic is called, so this.state.singleDocIsPublic persists to database...
  })
  .catch(e => {
    console.log(e);
  });
}

export function copyLink() {
    var copyText = document.getElementById("gaia");
    copyText.select();
    document.execCommand("Copy");
    window.Materialize.toast("Link copied to clipboard", 1000);
  }

export function sharedInfoSingleDocRTC(props){
  this.setState({ receiverID: props, rtc: true });
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

export function sharedInfoSingleDocStatic(props){
  this.setState({ receiverID: props, rtc: false });
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
  const pubKey = this.state.pubKey;
  const fileName = 'shareddocs.json'
  const file = 'mine/' + pubKey + '/' + fileName;
  getFile(file, {decrypt: true})
  .then((fileContents) => {
    this.setState({ shareFile: JSON.parse(fileContents || '{}') })
    this.setState({ loading: "", show: "hide" });
  })
  .then(() => {
    const object = {};
    object.title = this.state.title;
    object.compressed = true;
    object.content = lzjs.compress(this.state.content);
    this.state.teamShare ? object.teamDoc = true : object.teamDoc = false;
    object.id = window.location.href.split('doc/')[1];
    object.receiverID = this.state.receiverID;
    object.words = wordcount(this.state.content);
    object.sharedWith = this.state.sharedWith;
    object.shared = getMonthDayYear();
    object.rtc = this.state.rtc;
    object.user = loadUserData().username;
    this.setState({ shareFile: [...this.state.shareFile, object], sharedWith: [...this.state.sharedWith, this.state.receiverID] });
    setTimeout(this.shareDoc, 700);
  })
  .catch(error => {
    console.log(error);
    this.setState({ loading: "", show: "hide" });

    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    if(this.state.teamShare === true) {
      object.teamDoc = true;
    }
    object.id = Date.now();
    object.receiverID = this.state.receiverID;
    object.words = wordcount(this.state.content);
    object.shared = getMonthDayYear();
    object.rtc = this.state.rtc;
    this.setState({ shareFile: [...this.state.shareFile, object] });
    setTimeout(this.shareDoc, 700);
  });
}

export function shareDoc() {
  const fileName = 'shareddocs.json'
  const pubKey = this.state.pubKey;
  const file = 'mine/' + pubKey + '/' + fileName;
  putFile(file, JSON.stringify(this.state.shareFile), {encrypt: true})
  .then(() => {
    this.setState({ shareModal: "hide", loading: "hide", show: "" });
  })
  .catch(e => {
    console.log("e");
    console.log(e);
  });

  const data = this.state.shareFile;
  const encryptedData = JSON.stringify(encryptECIES(pubKey, JSON.stringify(data)));
  const directory = 'shared/' + pubKey + fileName;
  putFile(directory, encryptedData, {encrypt: false})
  .then(() => {
    window.Materialize.toast('Document shared with ' + this.state.receiverID, 4000);
  })
  .catch(e => {
    console.log(e);
  });
  putFile(window.location.href.split('doc/')[1] + 'sharedwith.json', JSON.stringify(this.state.sharedWith), {encrypt: true})
  .then(() => {
    if(this.state.teamShare === true) {
      this.setState({ count: this.state.count + 1 });
      setTimeout(this.shareToTeam, 300);
    } else {
      this.handleAutoAdd();
      this.loadAvatars();
    }
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
  this.setState({ title: e.target.value });
  clearTimeout(this.timeout);
  this.timeout = setTimeout(this.handleAutoAdd, 1500)
}

export function handleChange(value) {
  this.setState({ content: value });
  clearTimeout(this.timeout);
  this.timeout = setTimeout(this.handleAutoAdd, 1500)
  if (this.state.singleDocIsPublic === true) { //moved this conditional from handleAutoAdd, where it caused an infinite loop...
    this.sharePublicly() //this will call savePublic, which will call handleAutoAdd, so we'll be calling handleAutoAdd twice, but it's at least it's not an infinite loop!
  }
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
  const object = {};
  object.title = this.state.title;
  object.content = lzjs.compress(this.state.content);
  object.compressed = true;
  this.state.teamDoc ? object.teamDoc = true : object.teamDoc = false;
  if(window.location.href.split('doc/')[1] !==undefined) {
    object.id = parseInt(window.location.href.split('doc/')[1], 10)
  } else if(window.location.href.split('shared/')[1].split('/')[1]) {
    object.id = parseInt(this.state.tempDocId, 10);
  } else {
    object.id = parseInt(window.location.href.split('shared/')[1].split('/')[1], 10);
  }
  object.updated = getMonthDayYear();
  object.sharedWith = this.state.sharedWith;
  object.singleDocIsPublic = this.state.singleDocIsPublic; //true or false...
  object.readOnly = this.state.readOnly; //true or false...
  object.rtc = this.state.rtc;
  // object.author = loadUserData().username;
  object.words = wordcount(this.state.content) || "";
  object.tags = this.state.tags || [];
  object.fileType = "documents";
  object.spacing = this.state.spacing;
  console.log(object)
  this.setState({singleDoc: object}); //NOTE: this saves singleDoc...
  this.setState({autoSave: "Saving..."});
  const objectTwo = {};
  objectTwo.title = this.state.title;
  this.state.teamDoc ? objectTwo.teamDoc = true : objectTwo.teamDoc = false;
  if(window.location.href.split('doc/')[1] !==undefined) {
    objectTwo.id = parseInt(window.location.href.split('doc/')[1], 10)
  } else {
    objectTwo.id = parseInt(window.location.href.split('shared/')[1].split('/')[1], 10);
  }
  objectTwo.updated = getMonthDayYear();
  objectTwo.words = wordcount(this.state.content);
  objectTwo.sharedWith = this.state.sharedWith;
  objectTwo.rtc = this.state.rtc;
  objectTwo.singleDocIsPublic = this.state.singleDocIsPublic; //true or false...
  objectTwo.readOnly = this.state.readOnly; //true or false...
  // objectTwo.author = loadUserData().username;
  objectTwo.tags = this.state.tags;
  objectTwo.fileType = "documents";
  const index = this.state.index;
  const updatedDoc = update(this.state.value, {$splice: [[index, 1, objectTwo]]}); //splice is replacing 1 element at index position with objectTwo
  this.setState({value: updatedDoc});
  this.autoSave();
}

export function autoSave() {
  const file = window.location.href.split('doc/')[1] || this.state.tempDocId;
  const fullFile = '/documents/' + file + '.json';
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt: true})
  .then(() => {
    this.saveSingleDocCollection();
  })
  .catch(e => {
    console.log(e);
  });
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
      console.log(e);
    });
}

export function componentDidMountData(props) {


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
      const thisDoc = value.find((doc) => { return doc.id.toString() === props}); //comparing strings
      let index = thisDoc && thisDoc.id;
      console.log(index);
      function findObjectIndex(doc) {
          return doc.id === index; //comparing numbers
      }
      this.setState({index: value.findIndex(findObjectIndex)})
   })
    .catch(error => {
      console.log(error);
    });

getFile(fullFile, {decrypt: true})
 .then((fileContents) => {
   console.log(JSON.parse(fileContents || '{}').id);
    this.setState({
      title: JSON.parse(fileContents || '{}').title,
      content: JSON.parse(fileContents || '{}').content,
      tags: JSON.parse(fileContents || '{}').tags,
      singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic,
      idToLoad: window.location.href.split('doc/')[1],
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

export function print() {
  window.print();
}

export function shareToTeam() {

  this.setState({ teamDoc: true, teamShare: true, loadingIndicator: true, action: "Shared document id " + window.location.href.split('doc/')[1] + " with team."})
  const {team, count} = this.state;
  if(team.length > count) {
    this.setState({ auditThis: true });
    if(team[count].blockstackId !== loadUserData().username) {
      this.sharedInfoSingleDocRTC(team[count].blockstackId);
    } else {
      this.setState({ count: this.state.count + 1 });
      setTimeout(this.shareToTeam, 300);
    }
  } else {
    this.setState({ teamShare: false, loadingIndicator: false })
    window.$('#teamShare').modal('close');
    if(this.state.slackConnected){
      this.postToSlack();
    }
    if(this.state.webhookConnected) {
      const object = {};
      object.title = this.state.title;
      object.content = this.state.content;
      object.words = wordcount(this.state.content);;
      object.sharedWith = this.state.sharedWith;
      this.postToWebhook(object);
    }
    this.handleAutoAdd();
    this.loadAvatars();
  }
}

export function sendArticle() {
  this.setState({sentArticles: [...this.state.sentArticles, this.state.singleDoc]})
  setTimeout(this.saveSend, 300);
  this.setState({send: false})
}

export function downloadDoc(props) {
  if(props === "word") {
    var content = '<!DOCTYPE html>' + this.state.content;
    var converted = htmlDocx.asBlob(content);
    var blob = new Blob([converted], {type: "application/msword"});
    FileSaver.saveAs(blob, "helloworld.docx");
  } else if(props === "rtf") {
    console.log("rtf")
  } else if(props === 'pdf') {
    console.log('pdf')
    html2pdf(this.state.content);
  } else if(props === 'txt') {
    window.open("data:application/txt," + encodeURIComponent(this.state.content.replace(/<[^>]+>/g, '')), "_self");
  }

}

export function formatSpacing(props) {
  if(props === 'single') {
    document.getElementsByClassName('ql-editor')[0].style.lineHeight = 1;
    this.setState({spacing: 1})
  } else if(props === 'double') {
    document.getElementsByClassName('ql-editor')[0].style.lineHeight = 2;
    this.setState({spacing: 2})
  }

}
