import {
  putFile,
  getFile,
  loadUserData
} from 'blockstack';


import update from 'immutability-helper';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
const { getPublicKeyFromPrivate } = require('blockstack');
const { decryptECIES } = require('blockstack/lib/encryption');


const { encryptECIES } = require('blockstack/lib/encryption');

export function loadCollection() {
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {

     if(JSON.parse(fileContents || '{}').value) {
       this.setState({ value: JSON.parse(fileContents || '{}').value });
       this.setState({filteredValue: JSON.parse(fileContents || '{}').value})
       this.setState({ loading: "hide" });
     } else {
       console.log("No saved files");
       this.setState({ loading: "hide" });
     }
   })
    .catch(error => {
      console.log(error);
    });
}

export function setTags(e) {
  this.setState({ tag: e.target.value});
}

export function handleKeyPress(e) {
  if (e.key === 'Enter') {
    this.setState({ singleDocTags: [...this.state.singleDocTags, this.state.tag]});
    this.setState({ tag: "" });
  }
}

export function addTagManual() {
  this.setState({ singleDocTags: [...this.state.singleDocTags, this.state.tag]});
  this.setState({ tag: "" });
}

export function handleaddItem() {
  const rando = Date.now();
  const object = {};
  object.title = "Untitled";
  object.id = rando;
  object.updated = getMonthDayYear();
  object.tags = [];
  object.sharedWith = [];
  const objectTwo = {}
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.updated = object.created;
  objectTwo.content = "";
  objectTwo.tags = [];
  objectTwo.sharedWith = [];

  this.setState({ value: [...this.state.value, object], filteredValue: [...this.state.filteredValue, object], singleDoc: objectTwo, tempDocId: object.id  }, () => {
    this.saveNewFile();
  });
}

export function filterList(event){
  var updatedList = this.state.value;
  updatedList = updatedList.filter(function(item){
    return item.title.toLowerCase().search(
      event.target.value.toLowerCase()) !== -1;
  });
  this.setState({filteredValue: updatedList});
}

export function saveNewFile() {
  putFile("documentscollection.json", JSON.stringify(this.state), {encrypt:true})
    .then(() => {
      // this.saveNewSingleDoc();
      console.log("Saved Collection!");
      setTimeout(this.saveNewSingleDoc, 200);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveNewSingleDoc() {
  const file = this.state.tempDocId;
  const fullFile = '/documents/' + file + '.json'
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
    .then(() => {
      if(!window.location.href.includes('google') && !window.location.href.includes('documents/doc/')) {
        this.setState({ redirect: true });
      } else if(window.location.href.includes('documents/doc/')) {
        window.open(window.location.origin + '/documents/doc/' + this.state.tempDocId, '_blank');
      } else {
        window.Materialize.toast(this.state.title + " added!", 4000);
      }
      if(this.state.importAll) {
        this.setState({ count: this.state.count + 1 });
      }
    })
    .then(() => {
      if(this.state.importAll) {
        this.importAllGDocs();
      }
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function handlePageChange(event) {
  this.setState({
    currentPage: Number(event.target.id)
  });
}

export function handleCheckbox(event) {
  let checkedArray = this.state.docsSelected;
    let selectedValue = event.target.value;

      if (event.target.checked === true) {
        checkedArray.push(selectedValue);
          this.setState({
            docsSelected: checkedArray
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
            docsSelected: checkedArray
          });
          if(checkedArray.length === 1) {
            this.setState({activeIndicator: true});
          } else {
            this.setState({activeIndicator: false});
          }
      }
}

export function sharedInfo(props) {
  const user = props;
  const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  this.setState({ receiverID: props, rtc: true })
  getFile('key.json', options)
    .then((file) => {
      this.setState({ pubKey: JSON.parse(file)})
    })
      .then(() => {
        this.loadSharedCollection();
      })
      .catch(error => {
        console.log("No key: " + error);
        window.Materialize.toast(props + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
        this.setState({ shareModal: "hide", loadingTwo: "hide", contactDisplay: ""});
      });
}

export function sharedInfoStatic(props) {
  const user = props;
  const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  this.setState({ receiverID: props, rtc: false })
  getFile('key.json', options)
    .then((file) => {
      this.setState({ pubKey: JSON.parse(file)})
    })
      .then(() => {
        this.loadSharedCollection();
      })
      .catch(error => {
        console.log("No key: " + error);
        window.Materialize.toast(props + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
        this.setState({ shareModal: "hide", loadingTwo: "hide", contactDisplay: ""});
      });
}

export function loadSharedCollection () {
  // const user = this.state.receiverID;
  // const file = "shared.json";
  // getFile(user + file, {decrypt: true})
  const pubKey = this.state.pubKey;
  const fileName = 'shareddocs.json'
  const file = 'mine/' + pubKey + '/' + fileName;
  getFile(file, {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        this.setState({ sharedCollection: JSON.parse(fileContents || '{}') })
      } else {
        this.setState({ sharedCollection: [] });
      }
    })
    .then(() => {
      this.loadSingle();
    })
    .catch((error) => {
      console.log(error)
    });
}

export function loadSingle() {

  if(this.state.docsSelected.length > 1) {
    //TODO figure out how to handle this
  } else {
    const thisFile = this.state.docsSelected[0];
    const fullFile = '/documents/' + thisFile + '.json';

    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       if(JSON.parse(fileContents || '{}').sharedWith) {
         console.log(JSON.parse(fileContents || '{}'))
         this.setState({
           title: JSON.parse(fileContents || '{}').title,
           content: JSON.parse(fileContents || '{}').content,
           tags: JSON.parse(fileContents || '{}').tags,
           updated: JSON.parse(fileContents || '{}').updated,
           words: JSON.parse(fileContents || '{}').words,
           id: JSON.parse(fileContents || '{}').id,
           sharedWithSingle: JSON.parse(fileContents || '{}').sharedWith
        });
      } else {
        this.setState({
          title: JSON.parse(fileContents || '{}').title,
          content: JSON.parse(fileContents || '{}').content,
          tags: JSON.parse(fileContents || '{}').tags,
          updated: JSON.parse(fileContents || '{}').updated,
          words: JSON.parse(fileContents || '{}').words,
          id: JSON.parse(fileContents || '{}').id,
          sharedWithSingle: []
       });
      }

     })
      .then(() => {
        this.setState({ sharedWithSingle: [...this.state.sharedWithSingle, this.state.receiverID] });
        setTimeout(this.getCollection, 300);
      })
      .catch(error => {
        console.log(error);
      });
    }
}

export function getCollection() {
  getFile("documentscollection.json", {decrypt: true})
  .then((fileContents) => {
     this.setState({ value: JSON.parse(fileContents || '{}').value })
     this.setState({ initialLoad: "hide" });
  }).then(() =>{
    let value = this.state.value;
    const thisDoc = value.find((doc) => { return doc.id.toString() === this.state.docsSelected[0]});
    let index = thisDoc && thisDoc.id;
    function findObjectIndex(doc) {
        return doc.id === index; //this is comparing numbers
    }
    this.setState({index: value.findIndex(findObjectIndex) });
  })
    .then(() => {
      this.share();
    })
    .catch(error => {
      console.log(error);
    });
}

export function share() {
  const object = {};
  object.title = this.state.title;
  object.content = this.state.content;
  object.id = this.state.id.toString();
  object.updated = this.state.updated;
  object.sharedWith = this.state.sharedWithSingle;
  object.tags = this.state.tags;
  object.words = this.state.words;
  object.rtc = this.state.rtc;
  const index = this.state.index;
  const updatedDocs = update(this.state.value, {$splice: [[index, 1, object]]});  // array.splice(start, deleteCount, item1)
  this.setState({value: updatedDocs, singleDoc: object, sharedCollection: [...this.state.sharedCollection, object]});

  setTimeout(this.saveSharedFile, 300);
}

export function saveSharedFile() {
  // const user = this.state.receiverID;
  // const file = "shared.json";
  //
  // putFile(user + file, JSON.stringify(this.state.sharedCollection), {encrypt: true})
  const fileName = 'shareddocs.json'
  const pubKey = this.state.pubKey;
  const file = 'mine/' + pubKey + '/' + fileName;
  putFile(file, JSON.stringify(this.state.sharedCollection), {encrypt: true})
    .then(() => {
      console.log("Shared Collection Saved");
      // this.saveSingleFile();
      window.$('#shareModal').modal('close');
      window.$('#encryptedModal').modal('close');
    })

    const data = this.state.sharedCollection;
    const encryptedData = JSON.stringify(encryptECIES(pubKey, JSON.stringify(data)));
    const directory = 'shared/' + pubKey + fileName;
    putFile(directory, encryptedData, {encrypt: false})
    .then(() => {
      window.Materialize.toast('Document shared with ' + this.state.receiverID, 4000);
    })
    .catch(e => {
      console.log(e);
    });
    putFile(this.state.docsSelected[0] + 'sharedwith.json', JSON.stringify(this.state.sharedWith), {encrypt: true})
    .then(() => {
      // this.handleAutoAdd();
      // this.loadAvatars();
      this.saveSingleFile();
    })
    .catch(e => {
      console.log(e);
    });
}

export function saveSingleFile() {
  const file = this.state.docsSelected[0];
  const fullFile = '/documents/' + file + '.json'
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      this.saveCollection();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveCollection() {
  putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
    .then(() => {
      console.log("Saved Collection");
      // this.sendFile();
      this.setState({ title: "Untitled"})
    })
    .then(() => {
      this.loadCollection();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function sendFile() {
  const user = this.state.receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'shareddocs.json'
  const file = userShort + fileName;
  const publicKey = this.state.pubKey;
  const data = this.state.sharedCollection;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const directory = '/shared/' + file;
  putFile(directory, encryptedData, {encrypt: false})
    .then(() => {
      console.log("Shared encrypted file ");
      window.Materialize.toast('Document shared with ' + this.state.receiverID, 4000);
      this.loadCollection();
      this.setState({shareModal: "hide", loadingTwo: "hide", contactDisplay: ""});
    })
    .catch(e => {
      console.log(e);
    });
}

export function loadSingleTags() {

  this.setState({tagDownload: false});
  const thisFile = this.state.docsSelected[0];
  const fullFile = '/documents/' + thisFile + '.json';

  getFile(fullFile, {decrypt: true})
   .then((fileContents) => {
     if(JSON.parse(fileContents || '{}').tags) {
       this.setState({
         shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
         title: JSON.parse(fileContents || '{}').title,
         id: JSON.parse(fileContents || '{}').id,
         updated: JSON.parse(fileContents || '{}').updated,
         sharedWith: JSON.parse(fileContents || '{}').sharedWith,
         singleDocTags: JSON.parse(fileContents || '{}').tags,
         content: JSON.parse(fileContents || '{}').content
      });
    } else {
      this.setState({
        shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
        title: JSON.parse(fileContents || '{}').title,
        id: JSON.parse(fileContents || '{}').id,
        updated: JSON.parse(fileContents || '{}').updated,
        sharedWith: JSON.parse(fileContents || '{}').sharedWith,
        singleDocTags: [],
        content: JSON.parse(fileContents || '{}').content
     });
    }
   })
   .then(() => {
     this.setState({ tagModal: ""});
     setTimeout(this.getCollectionTags, 300);
   })
    .catch(error => {
      console.log(error);
    });
}

export function getCollectionTags() {
  getFile("documentscollection.json", {decrypt: true})
  .then((fileContents) => {
     this.setState({ value: JSON.parse(fileContents || '{}').value })
     this.setState({ initialLoad: "hide" });
  }).then(() =>{
    let value = this.state.value;
    const thisDoc = value.find((doc) => { return doc.id.toString() === this.state.docsSelected[0]});
    let index = thisDoc && thisDoc.id;
    function findObjectIndex(doc) {
        return doc.id === index; //this is comparing numbers
    }
    this.setState({index: value.findIndex(findObjectIndex) });
  })
    .catch(error => {
      console.log(error);
    });
}

export function saveNewTags() {
  this.setState({ loadingTwo: ""});
  const object = {};
  object.id = this.state.id;
  object.title = this.state.title;
  object.updated = this.state.updated;
  object.tags = this.state.singleDocTags;
  object.content = this.state.content;
  object.sharedWith = this.state.sharedWith;
  const objectTwo = {};
  objectTwo.title = this.state.title;
  objectTwo.id = this.state.id;
  objectTwo.updated = this.state.updated;
  objectTwo.sharedWith = this.state.sharedWith;
  objectTwo.tags = this.state.singleDocTags
  const index = this.state.index;
  const updatedDoc = update(this.state.value, {$splice: [[index, 1, objectTwo]]});
  this.setState({value: updatedDoc, filteredValue: updatedDoc, singleDoc: object });
  setTimeout(this.saveFullCollectionTags, 500);
  window.$('#tagModal').modal('close');
}

export function saveFullCollectionTags() {
  putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
    .then(() => {
      console.log("Saved");
      this.saveSingleDocTags();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveSingleDocTags() {
  const thisFile = this.state.docsSelected[0];
  const fullFile = '/documents/' + thisFile + '.json';
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
    .then(() => {
      console.log("Saved tags");
      this.setState({ tagModal: "hide", loadingTwo: "hide" });
      this.loadCollection();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function deleteTag(props) {
  let tags = this.state.singleDocTags;
  const thisTag = tags.find((tag) => { return tag.id === props});
  let tagIndex = thisTag && thisTag.id;
  function findObjectIndex(tag) {
      return tag.id === tagIndex; //this is comparing numbers
  }
  this.setState({ tagIndex: tags.findIndex(findObjectIndex) });
  this.setState({singleDocTags: update(this.state.singleDocTags, {$splice: [[this.state.tagIndex, 1]]})});
}

export function collabFilter(props) {
  let value = this.state.value;
  let collaboratorFilter = value.filter(x => typeof x.sharedWith !== 'undefined' ? x.sharedWith.includes(props) : console.log(""));
  this.setState({ filteredValue: collaboratorFilter, appliedFilter: true});
  window.$('.button-collapse').sideNav('hide');
}

export function tagFilter(props) {
  let value = this.state.value;
  let tagFilter = value.filter(x => typeof x.tags !== 'undefined' ? x.tags.includes(props) : console.log(""));
  this.setState({ filteredValue: tagFilter, appliedFilter: true});
  window.$('.button-collapse').sideNav('hide');
}

export function dateFilter(props) {
  let value = this.state.value;
  let dateFilter = value.filter(x => x.updated.includes(props));
  this.setState({ filteredValue: dateFilter, appliedFilter: true});
  window.$('.button-collapse').sideNav('hide');
}

export function clearFilter() {
  this.setState({ appliedFilter: false, filteredValue: this.state.value});
}

export function setDocsPerPage(e) {
  this.setState({ docsPerPage: e.target.value});
}

export function loadTeamDocs() {
  console.log("Loading team docs...")
  const { team, count } = this.state;
  if(team.length > count) {
    let publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    let fileString = 'shareddocs.json'
    let file = publicKey + fileString;
    const directory = 'shared/' + file;
    const user = team[count].blockstackId;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    getFile(directory, options)
     .then((fileContents) => {
       let privateKey = loadUserData().appPrivateKey;
       this.setState({
         docs: this.state.docs.concat(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents)))),
         count: this.state.count + 1
       })
     })
     .then(() => {
       this.loadTeamDocs();
     })
      .catch(error => {
        console.log(error);
        this.setState({ count: this.state.count + 1})
        this.loadTeamDocs();
      });
  } else {
    console.log("No more files")
    this.setState({ count: 0, loadingIndicator: false });
  }
}
