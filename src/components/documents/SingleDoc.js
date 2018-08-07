import React, { Component } from "react";

// import { Link } from 'react-router-dom';
// import PublicDoc from '../PublicDoc.js'; //rendering this here, as a child of SingleDoc. will pass it props.
import { loadIntegrations } from '../helpers/integrations';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
import {
  postToMedium,
  loadMediumToken
} from '../helpers/traditionalIntegrations';
import {
  loadUserData,
  getFile,
  putFile,
  isUserSignedIn
} from 'blockstack';
import update from 'immutability-helper';
import RemoteStorage from 'remotestoragejs';
// import Widget from 'remotestorage-widget';
import QuillEditorPublic from '../QuillEditorPublic.js'; //this will render Yjs...
import QuillEditorPrivate from '../QuillEditorPrivate.js';

// import axios from 'axios';
const wordcount = require("wordcount");
const { encryptECIES } = require('blockstack/lib/encryption');
// const { decryptECIES } = require('blockstack/lib/encryption');
// const { getPublicKeyFromPrivate } = require('blockstack');
const remoteStorage = new RemoteStorage({logging: false});
// const widget = new Widget(remoteStorage);


export default class SingleDoc extends Component {

  constructor(props) {
    super(props);
    this.state = {
      stealthyConnected: false,
      travelstackConnect: false,
      coinsConnected: false,
      team: [],
      value: [], //NOTE: do we need an array of all the users's docs saved within the state of each SingleDoc?
      contacts: [],
      tags: [],
      title: "",
      content: "", //updating this in handleChangeInTextEdit...
      idToLoad: "", //updating this from getFile
      docLoaded: false,
      updated: "",
      words: "",
      index: "",
      save: "",
      loading: "hide",
      printPreview: false,
      autoSave: "Saved",
      receiverID: "",
      shareModal: "hide",
      shareFile: [],
      sharedWith: [],
      show: "",
      pubKey: "",
      singleDoc: {},
      singleDocIsPublic: false, //NOTE: this will be set to true by sharePublicly, and false by stopSharing. it will be saved to the database in handleAutoAdd...
      confirmAdd: false,
      singlePublic: {},
      readOnly: false, //NOTE: this will be for singlePublic, it will be updated by toggleReadOnly, and the state will be saved in handleAutoAdd, so it persists in database, then gets set by getFile within componentDidMount... also note, will initially be `undefined` in the console, because false is falsey, which is undefined...
      publicShare: "hide",
      gaiaLink: "",
      hideStealthy: true,
      hideContact: "",
      revealModule: "innerStealthy",
      to: "",
      blogPost: {},
      blogIndex: [],
      blogModal: "hide",
      docFlex: "test-doc-card",
      remoteStorage: false,
      remoteTitle: "",
      remoteContent: "",
      remoteWords: "",
      remoteId: "",
      remoteUpdated: "",
      highlightedText: "",
      selection: "",
      showCommentModal: "hide",
      comments: [],
      commentInput: "",
      notificationCount: 0,
      listComments: "hide",
      reviewSelection: "",
      commentId: "",
      deleteIndex: "",
      enterpriseUser: false,
      journalismUser: false,
      submittedArticle: {},
      submitted: [],
      send: false,
      graphitePublicKey: "",
      clients: [],
      editorView: "",
      editorName: "",
      editorRoles: "",
      editorPermissions: "",
      editorIntegrations: "",
      journoView: "",
      journoName: "",
      journoRoles: "",
      journoPermissions: "",
      journoIntegrations: "",
      editorShare: false,
      editorPublish: false,
      editorComment: false,
      editorAssign: false,
      journoShare: false,
      journoPublish: false,
      journoComment: false,
      journoAssign: false,
      integrations: [],
      userRole: "",
      accountSettings: "",
      role: "",
      clientType: "",
      sentArticles: [],
      // timerKey: "", //will update this to reset Timer
      yjsConnected: false,
      teamCount: 0,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleAutoAdd = this.handleAutoAdd.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.shareModal = this.shareModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.shareDoc = this.shareDoc.bind(this);
    this.sharedInfo = this.sharedInfo.bind(this);
    this.handleBack = this.handleBack.bind(this); //this is here to resolve auto-save and home button conflicts
    this.sharePublicly = this.sharePublicly.bind(this);
    this.savePublic = this.savePublic.bind(this);
    this.stopSharing = this.stopSharing.bind(this);
    this.saveStop = this.saveStop.bind(this);
    this.toggleReadOnly = this.toggleReadOnly.bind(this);
    this.getYjsConnectionStatus = this.getYjsConnectionStatus.bind(this);
  }

  componentWillMount() {
    console.warn('0. SingleDoc - componentWillMount, then render...')
    this.loadIntegrations = loadIntegrations.bind(this);
    this.postToMedium = postToMedium.bind(this);
    this.loadMediumToken = loadMediumToken.bind(this);
    isUserSignedIn ? this.loadIntegrations() : this.loadUserData();
  }

  componentDidMount() {

    window.$('.modal').modal();
    window.$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'left', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    });
    // let privateKey = loadUserData().appPrivateKey;

    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'right', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    });

    const thisFile = this.props.match.params.id;
    const fullFile = '/documents/' + thisFile + '.json';
    // remoteStorage.access.claim(this.props.match.params.id, 'rw');
    // remoteStorage.caching.enable('/' + this.props.match.params.id + '/');
    // const client = remoteStorage.scope('/' + this.props.match.params.id + '/');
    // widget.attach('remote-storage-element-id');
    // remoteStorage.on('connected', () => {
    //   const userAddress = remoteStorage.remote.userAddress;
    //   console.debug(`${userAddress} connected their remote storage.`);
    //   client.getFile('title.txt').then(file => {
    //     if(file.data != null) {
    //       this.setState({ remoteTitle: file.data });
    //     }
    //   });
    //
    //   client.getFile('content.txt').then(file => {
    //     if(file.data != null) {
    //       this.setState({ remoteContent: decryptECIES(privateKey, JSON.parse(file.data)) });
    //     }
    //   });
    //
    //   client.getFile('wordCount.txt').then(file => {
    //     if(file.data != null) {
    //       this.setState({ remoteWords: decryptECIES(privateKey, JSON.parse(file.data)) });
    //     }
    //   });
    //
    //   client.getFile('id.txt').then(file => {
    //     if(file.data != null) {
    //       this.setState({ remoteId: decryptECIES(privateKey, JSON.parse(file.data)) });
    //     }
    //   });
    //
    //   client.getFile('updated.txt').then(file => {
    //     if(file.data != null) {
    //       this.setState({ remoteUpdated: decryptECIES(privateKey, JSON.parse(file.data)) });
    //     }
    //   });
    //
    // })
    //
    // remoteStorage.on('network-offline', () => {
    //   console.debug(`We're offline now.`);
    // })
    //
    // remoteStorage.on('network-online', () => {
    //   console.debug(`Hooray, we're back online.`);
    // })

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

    getFile(this.props.match.params.id + 'sharedwith.json', {decrypt: true})
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
        return doc.id.toString() === this.props.match.params.id //this is comparing a string to a string
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
      console.log("SingleDoc - getFile, fileContents is: ")
      console.log( JSON.parse(fileContents || '{}') )
      this.setState({
        //NOTE: don't need author, not setting that state attribute...
        title: JSON.parse(fileContents || '{}').title,
        content: JSON.parse(fileContents || '{}').content,
        tags: JSON.parse(fileContents || '{}').tags,
        idToLoad: JSON.parse(fileContents || '{}').id,
        singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
        docLoaded: true,
        readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
      })
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
  } //end of componentDidMount

  componentDidUpdate(prevProps) {
    if(this.state.confirmAdd === true) {
      this.sharedInfo();
    }
    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'right', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    });
  } //end of componentDidUpdate


  getYjsConnectionStatus(status) {
    this.setState({ yjsConnected: status}) //set status of yjsConnected based on connection.connected in Yjs... then if yjsConnect is true, start timer in Timer component. if not connected, don't start timer.
  }

  toggleReadOnly() { //make this function toggleReadyOnly state instead, so user can press button again!!!!
    console.error('SingleDoc - toggleReadOnly called, changing readOnly state based on prevState...')
    console.log('0. toggleReadOnly - this.state.readOnly is: ', this.state.readOnly)
    this.setState(
      prevState => ({ readOnly: !prevState.readOnly }) //setState of readOnly to the opposite of its previous state...
    )
    setTimeout(this.sharePublicly, 700); //call sharePublicly on a slight delay, so state has updated since calling setState above...
  }

  sharePublicly() {
    this.setState({ publicShare: ""});
    console.log("sharePublicly called!")
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    console.error('in sharePublicly, this.state.content is: ', this.state.content)
    object.words = wordcount(this.state.content);
    object.shared = getMonthDayYear();
    object.readOnly = this.state.readOnly;
    object.singleDocIsPublic = true; //adding this so PublicDoc knows to display doc or not, below sets singleDocIsPublic to true in state, here we are ensuring it will be true for singleDoc object...
    this.setState({
      singlePublic: object,
      singleDocIsPublic: true
    })
    setTimeout(this.savePublic, 700); //calling on a slight delay so state can update...
  }

  stopSharing() {
    console.log("stopSharing called!")
    this.setState({
      singlePublic: {}, //this is setting singlePublic object to an empty object, which means its singleDocIsPublic key value will be falsy...
      singleDocIsPublic: false
    })
    setTimeout(this.saveStop, 700);
  }


  saveStop() {
    console.log("saveStop called, this.state.singlePublic: ", this.state.singlePublic);
    // const user = loadUserData().username;
    // const userShort = user.slice(0, -3);
    const params = this.props.match.params.id;
    const directory = 'public/';
    const file = directory + params + '.json'
    console.warn("SingleDoc - saveStop --> putFile #1...")
    console.warn("000000 ----->>>> SingleDoc - saveStop --> putFile >>>>> this.state.singlePublic is: ", this.state.singlePublic)
    putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
    .then(() => {
      window.Materialize.toast(this.state.title + " is no longer publicly shared.", 4000);
      this.handleAutoAdd();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  }

  savePublic() {
    const user = loadUserData().username;
    // const userShort = user.slice(0, -3);
    const id = this.props.match.params.id
    const link = window.location.origin + '/shared/docs/' + user + '-' + id;
    console.log("savePublic - savePublic link: ", link);
    // const params = this.props.match.params.id;
    const directory = 'public/';
    const file = directory + id + '.json';
    console.warn("SingleDoc - savePublic --> putFile #2...")
    putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
    .then(() => {
      console.log("Shared Public Link")
      this.setState({gaiaLink: link, publicShare: "", shareModal: "hide"});
      this.handleAutoAdd() //call this every time savePublic is called, so this.state.singleDocIsPublic persists to database...
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  }

  copyLink() {
    var copyText = document.getElementById("gaia");
    copyText.select();
    document.execCommand("Copy");
    window.Materialize.toast("Link copied to clipboard", 1000);
  }

  sharedInfo() {
    this.setState({ confirmAdd: false });
    const user = this.state.receiverID;
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

  loadMyFile() {
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const fileName = 'shareddocs.json'
    const file = userShort + fileName;
    getFile(file, {decrypt: true})
    .then((fileContents) => {
      this.setState({ shareFile: JSON.parse(fileContents || '{}') })
      console.log("Step Two: Loaded share file");
      this.setState({ loading: "", show: "hide" });

      const object = {};
      object.title = this.state.title;
      object.content = this.state.content;
      object.id = Date.now();
      object.receiverID = this.state.receiverID;
      object.words = wordcount(this.state.content);
      object.shared = getMonthDayYear();
      console.warn('1. in SingleDoc, loadMyFile - called getMonthDayYear...')
      this.setState({ shareFile: [...this.state.shareFile, object], sharedWith: [...this.state.sharedWith, this.state.receiverID] });
      setTimeout(this.shareDoc, 700);
    })
    .catch(error => {
      console.log(error);
      console.log("Step Two: No share file yet, moving on");
      this.setState({ loading: "", show: "hide" });

      const object = {};
      object.title = this.state.title;
      object.content = this.state.content;
      object.id = Date.now();
      object.receiverID = this.state.receiverID;
      object.words = wordcount(this.state.content);
      object.shared = getMonthDayYear();
      console.warn('2. in SingleDoc, loadMyFile - called getMonthDayYear...')
      this.setState({ shareFile: [...this.state.shareFile, object] });
      setTimeout(this.shareDoc, 700);
    });
  }

  shareDoc() {
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const fileName = 'shareddocs.json'
    const file = userShort + fileName;
    console.warn("SingleDoc - shareDoc --> putFile #3...")
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
    console.warn("SingleDoc - shareDoc --> putFile #4...")
    putFile(directory, encryptedData, {encrypt: false})
    .then(() => {
      console.log("Shared encrypted file ");
      window.Materialize.toast('Document shared with ' + this.state.receiverID, 4000);
    })
    .catch(e => {
      console.log(e);
    });
    console.warn("SingleDoc - shareDoc --> putFile #5...")
    putFile(this.props.match.params.id + 'sharedwith.json', JSON.stringify(this.state.sharedWith), {encrypt: true})
    .then(() => {
      console.log("Shared With File Updated")
      this.handleAutoAdd();
    })
    .catch(e => {
      console.log(e);
    });
  }

  shareModal() {
    this.setState({
      shareModal: ""
    });
  }

  hideModal() {
    this.setState({
      shareModal: "hide",
      blogModal: "hide"
    });
  }

  handleTitleChange(e) {
    this.setState({ title: e.target.value });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.handleAutoAdd, 1500) //title is different from content, so don't need to call sharePublicly...
  }

  handleChange(value) {
    console.log("SingleDoc - handleChange -> doing it")
    this.setState({ content: value });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.handleAutoAdd, 1500)
    if (this.state.singleDocIsPublic === true) { //moved this conditional from handleAutoAdd, where it caused an infinite loop...
      this.sharePublicly() //this will call savePublic, which will call handleAutoAdd, so we'll be calling handleAutoAdd twice, but it's at least it's not an infinite loop!
    }
  }

  handleIDChange(e) {
    this.setState({ receiverID: e.target.value })
  }

  handleBack() {
    if(this.state.autoSave === "Saving") {
      setTimeout(this.handleBack, 500);
    } else {
      window.location.replace("/documents");
    }
  }

  handleAutoAdd() { //this creates an object and stores it in state as singleDoc, then creates another object and stores it in state to value, an array of docs (probably same as collection?)...
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.id = parseInt(this.props.match.params.id, 10);
    object.updated = getMonthDayYear();
    object.sharedWith = this.state.sharedWith;
    object.singleDocIsPublic = this.state.singleDocIsPublic; //true or false...
    object.readOnly = this.state.readOnly; //true or false...
    // object.author = loadUserData().username;
    object.words = wordcount(this.state.content);
    object.tags = this.state.tags;
    object.fileType = "documents";
    this.setState({singleDoc: object}); //NOTE: this saves singleDoc...
    this.setState({autoSave: "Saving..."});
    const objectTwo = {};
    objectTwo.title = this.state.title;
    objectTwo.id = parseInt(this.props.match.params.id, 10);
    objectTwo.updated = getMonthDayYear();
    objectTwo.words = wordcount(this.state.content);
    objectTwo.sharedWith = this.state.sharedWith;
    objectTwo.singleDocIsPublic = this.state.singleDocIsPublic; //true or false...
    objectTwo.readOnly = this.state.readOnly; //true or false...
    // objectTwo.author = loadUserData().username;
    objectTwo.tags = this.state.tags;
    objectTwo.fileType = "documents";
    const index = this.state.index;
    const updatedDoc = update(this.state.value, {$splice: [[index, 1, objectTwo]]}); //splice is replacing 1 element at index position with objectTwo
    this.setState({value: updatedDoc});
    this.autoSave();
    console.log("after save")
  };

  autoSave() {
    const file = this.props.match.params.id;
    const fullFile = '/documents/' + file + '.json';
    console.warn("SingleDoc - autoSave --> putFile #6...")
    putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt: true})
    .then(() => {
      console.log("Autosaved");
      this.saveCollection();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
    remoteStorage.access.claim(this.props.match.params.id, 'rw');
    remoteStorage.caching.enable('/' + this.props.match.params.id + '/');
    // const client = remoteStorage.scope('/' + this.props.match.params.id + '/');
    // const content = this.state.content;
    // const title = this.state.title;
    // const singleDocIsPublic = (this.state.singleDocIsPublic === true ? "true" : "false"); //true or false, as a string...
    // const singleDocIsPublic = this.state.singleDocIsPublic; //true or false
    // const words = wordcount(this.state.content);
    // const updated = getMonthDayYear();
    // const id = parseInt(this.props.match.params.id, 10);
    // const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    // client.storeFile('text/plain', 'content.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(content))))
    // .then(() => { console.log("Upload done - content") });
    // client.storeFile('text/plain', 'title.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(title))))
    // .then(() => { console.log("Upload done - title") });
    // client.storeFile('text/plain', 'singleDocIsPublic.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(singleDocIsPublic))))
    // .then(() => { console.log("Upload done - singleDocIsPublic") });
    // client.storeFile('text/plain', 'wordCount.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(words))))
    // .then(() => { console.log("Upload done - wordCount") });
    // client.storeFile('text/plain', 'updated.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(updated))))
    // .then(() => { console.log("Upload done - updated") });
    // client.storeFile('text/plain', 'id.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(id))))
    // .then(() => { console.log("Upload done - id") });
  }

  saveCollection() {
    console.warn("SingleDoc - saveCollection --> putFile #6...")
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


  print() {
    window.print();
  }

  sendArticle() {
    this.setState({sentArticles: [...this.state.sentArticles, this.state.singleDoc]})
    setTimeout(this.saveSend, 300);


    this.setState({send: false})
  }

  render() {
    if (this.state.docLoaded === true) {
      // console.warn("SingleDoc - render - docLoaded is true...")
      this.state.commentId === "" ? console.log("1. no index set") : this.resolveComment();
      this.state.reviewSelection === "" ? console.log("2. no comment selected") : this.getCommentSelection();
      this.state.send === false ? console.log("3. No article sent") : this.sendArticle();
      // console.log("SingleDoc - render - this.state: ", this.state)
      // console.warn("SingleDoc - render - title: ", this.state.title)
      // console.warn("SingleDoc - render - content: ", this.state.content)
    } else {
      console.log("SingleDoc - render - docLoaded: ", this.state.docLoaded)
    }

    console.log('id to load: ' + this.state.idToLoad);
    let words;
    if(this.state.content) {
      words = wordcount(this.state.content.replace(/<(?:.|\n)*?>/gm, ''));
    } else {
      words = 0;
    }

    const { mediumConnected, graphitePro, showCommentModal, comments, remoteStorage, loading, save, autoSave, contacts, hideStealthy, revealModule} = this.state
    const stealthy = (hideStealthy) ? "hide" : "";

    const remoteStorageActivator = remoteStorage === true ? "" : "hide";
    var content = "<p style='text-align: center;'>" + this.state.title + "</p> <div style='text-indent: 30px;'>" + this.state.content + "</div>";
    // var htmlString = window.$('<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">').html('<body>' + content + '</body>' ).get().outerHTML;

    var htmlDocument = '<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><xml><word:WordDocument><word:View>Print</word:View><word:Zoom>90</word:Zoom><word:DoNotOptimizeForBrowser/></word:WordDocument></xml></head><body>' + content + '</body></html>';
    var dataUri = 'data:text/html,' + encodeURIComponent(htmlDocument);

    const {length} = contacts
    let users = '&length=' + length
    let k = 0
    for (const i of contacts) {
      users += '&id' + k + "=" + i.contact
      k += 1
    }
    // const to = (sharedWith && sharedWith[sharedWith.length - 1] && sharedWith[sharedWith.length - 1].contact) ? sharedWith[sharedWith.length - 1].contact : ''
    const stealthyUrlStub = (process.env.NODE_ENV !== 'production') ?
    'http://localhost:3030/?app=gd04012018' :
    'https://www.stealthy.im/?app=gd04012018';
    const stealthyUrl = stealthyUrlStub + users;

    // const stealthyModule = (length > 0) ? (
    const stealthyModule =  (
      <div className={stealthy}>
        <div id='stealthyCol' className='card'>
          <div className={revealModule}>
            <iframe title="Stealthy" src={stealthyUrl} id='stealthyFrame' />
          </div>
        </div>
      </div>
    )
    // ) : null

    let docFlex;
    if(this.state.hideStealthy === true) {
      docFlex = "test-doc-card";
    } else {
      docFlex = "test-with-module";
    }

    return (
      <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a onClick={this.handleBack} className="left brand-logo">
                <i className="small-brand material-icons">arrow_back</i>
              </a>

              <ul className="left toolbar-menu">
                <li className="document-title">
                  {
                    this.state.title
                    ?
                    (this.state.title.length > 15 ? this.state.title.substring(0,15)+"..." :  this.state.title)
                    :
                    "Title here..."
                  }
                </li>
                <li>
                  <a className="small-menu muted">{autoSave}</a>
                </li>
              </ul>
              <ul className="right toolbar-menu small-toolbar-menu auto-save">
                {/*this.state.role === "Editor" && this.state.editorShare === true || this.state.role === "Journalist" && this.state.journoShare === true ? <li><a className="tooltipped dropdown-button" data-activates="dropdown2" data-position="bottom" data-delay="50" data-tooltip="Share"><i className="small-menu material-icons">people</i></a></li> : <li className="hide"/>*/}
                <li>
                  <a className="tooltipped dropdown-button" data-activates="dropdown2" data-position="bottom" data-delay="50" data-tooltip="Share">
                    <i className="small-menu material-icons">people</i>
                  </a>
                </li>
                <li>
                  <a className="dropdown-button" data-activates="dropdown1">
                    <i className="small-menu material-icons">more_vert</i>
                  </a>
                </li>
                <li>
                  <a className="small-menu tooltipped stealthy-logo" data-position="bottom" data-delay="50" data-tooltip="Stealthy Chat" onClick={() => this.setState({hideStealthy: !hideStealthy})}>
                    <img className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/>
                  </a>
                </li>
              </ul>

              {/*Share Menu Dropdown*/}
              <ul id="dropdown2"className="dropdown-content collection cointainer">
                <li>
                  <span className="center-align">Select a contact to share with</span>
                </li>
                <a href="/contacts">
                  <li>
                    <span className="muted blue-text center-align">Or add new contact</span>
                  </li>
                </a>
                <li className="divider" />
                {
                  graphitePro ?
                  <li className="collection-item">
                    <a onClick={this.props.shareToTeam}>Share to entire team</a>
                  </li>
                  :
                  <li className="hide" />
                }
                {
                  contacts.slice(0).reverse().map(contact => {
                    return (
                      <li key={contact.contact}className="collection-item">
                        <a onClick={() => this.setState({ receiverID: contact.contact, confirmAdd: true })}>
                          <p>{contact.contact}</p>
                        </a>
                      </li>
                    )
                  })
                }
                </ul>
                {/*Share Menu Dropdown*/}

                {/* Dropdown menu content */}
                <ul id="dropdown1" className="dropdown-content single-doc-dropdown-content">
                  {/*<li>
                    <a onClick={() => this.setState({ remoteStorage: !remoteStorage })}>Remote Storage</a>
                  </li>*/}
                  <li className="divider"></li>
                  <li>
                    <a onClick={this.print}>Print</a>
                  </li>
                  <li>
                    <a download={this.state.title + ".doc"} href={dataUri}>Download</a>
                  </li>
                  <li>
                    <a className="modal-trigger" href="#publicModal">Public Link</a>
                  </li>

                  {
                    mediumConnected && graphitePro ?
                    <li>
                      <a onClick={this.postToMedium}>Post to Medium</a>
                    </li>
                    :
                    <li className="hide"></li>
                  }
                  <li className="divider"></li>
                  {/*<li>
                    <a data-activates="slide-out" className="menu-button-collapse button-collapse">Comments</a>
                  </li>*/}
                  {/*this.state.enterpriseUser === true ? <li><a href="#!">Tag</a></li> : <li className="hide"/>*/}
                  {/*this.state.enterpriseUser === true ? <li><a href="#!">History</a></li> : <li className="hide"/>*/}
                </ul>
              {/* End dropdown menu content */}

              {/*Show Comments Modal*/}
              <ul id="slide-out" className="comments-side-nav side-nav">
                {
                  comments.slice(0).reverse().map(comment => {
                    return (
                      <li key={comment.id}>
                        <p className="black-text commenter">From {comment.commenter}</p>
                        <p className="black-text highlightedComment">{comment.highlightedText}</p>
                        <p className="black-text comment">{comment.comment}</p>
                        <button
                          onClick={() => this.setState({ reviewSelection: comment.selection })}
                          className="black-text btn-flat">Review</button>
                        <button
                          onClick={() => this.setState({ reviewSelection: comment.selection, commentId: comment.id })}
                          className="btn-flat">Resolve</button>
                        <p className="divider"></p>
                      </li>
                    )
                  })
                }
              </ul>
              {/*End Show Comments Modal*/}

              {/*Add Comment Modal*/}
              <div className={showCommentModal}>
                <div id="modal1" className="modal">
                  <div className="">
                    <div className="modal-content">
                      <blockquote className="black-text">
                        {this.state.highlightedText}
                      </blockquote>
                      <h5 className="black-text">Add Comment</h5>

                      <textarea
                        defaultValue={this.state.commentInput}
                        onChange={this.handleCommentInput}
                        className="materialize-textarea black-text"
                        placeholder="Your comment"
                      />

                  </div>
                  <div className="modal-footer">
                    <a onClick={this.addComment} className="btn-flat modal-action">Save Comment</a>
                    <a onClick={this.cancelComment} className="modal-action grey-text btn-flat">Cancel</a>
                  </div>
                </div>
              </div>
            </div>
            {/*End Add Comment Modal*/}
          </div>
        </nav>
      </div>
      {/*Remote storae widget*/}
      <div className={remoteStorageActivator} id="remotestorage">
        <div id='remote-storage-element-id'>
        </div>
      </div>
      {/*Remote storae widget*/}


      {/* Public Link Modal */}

      <div id="publicModal" className="modal">
        <div className="modal-content">
          <h4>Share Publicly</h4>
          <p>This data is not encrypted and can be accessed by anyone with the link that will be generated.</p>
          {
            this.state.singleDocIsPublic === true ?
            <div>
              <p>This document is already being shared publicly.</p>
              <button onClick={this.sharePublicly} className="btn black">Show Link</button>
              <button onClick={this.toggleReadOnly} className="btn green">{this.state.readOnly === true ? "Make Editable" : "Make Read-Only"}</button>
              <button onClick={this.stopSharing} className="btn red">Stop Sharing Publicly</button>
              <p>
                {this.state.readOnly === true ? "This shared document is read-only." : "This shared document is editable."}
              </p>
            </div>
            :
            <button className="btn" onClick={this.sharePublicly}>Share publicly</button>
          }

          {
            this.state.gaiaLink !== "" ?
            <div>
              <p><a href={this.state.gaiaLink}>{this.state.gaiaLink}</a></p>
            </div>
            :
            <div className="hide" />
          }
        </div>
        <div className="modal-footer">
          <a onClick={() => this.setState({ publicShare: "hide"})}
            className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
          </div>
        </div>

        {/* End Public Link Modal */}
        {/* commenting out modal above, showing this message on the page for now instead... */}


        <div className="test-docs">
          <div className={docFlex}>
            <div className="double-space doc-margin">

              {
                this.state.title === "Untitled" ?
                <textarea
                  className="doc-title materialize-textarea"
                  placeholder="Give it a title"
                  type="text"
                  onChange={this.handleTitleChange}
                />
                :
                <textarea
                  className="doc-title materialize-textarea"
                  placeholder="Title"
                  type="text"
                  value={this.state.title}
                  onChange={this.handleTitleChange}
                />
              }

              <p className="hide">
                document access: <span>&nbsp;</span>
                {
                  (this.state.singleDocIsPublic === true) ?
                  <span style={{backgroundColor: "green", color: "white"}}>public</span>
                  :
                  <span style={{backgroundColor: "blue", color: "white"}}>private</span>
                }
              </p>

            {
              (this.state.singleDocIsPublic === true) ?
              <div>
                {
                  (this.state.docLoaded === true) ?
                  <QuillEditorPublic
                    roomId={this.state.idToLoad.toString()} //this needs to be a string!
                    docLoaded={this.state.docLoaded} //this is set by getFile
                    value={this.state.content}
                    onChange={this.handleChange}
                    getYjsConnectionStatus={this.getYjsConnectionStatus} //passing this through TextEdit to Yjs
                    yjsConnected={this.state.yjsConnected} //true or false, for TextEdit
                    singleDocIsPublic={this.state.singleDocIsPublic} //only calling on Yjs if singleDocIsPublic equals true
                  />
                  :
                  <div className="progress">
                    <div className="indeterminate"></div>
                  </div>
                }
              </div>
              :
              <div>
                {
                  (this.state.docLoaded === true) ?
                  <QuillEditorPrivate
                    roomId={this.state.idToLoad.toString()} //this needs to be a string!
                    docLoaded={this.state.docLoaded} //this is set by getFile
                    value={this.state.content}
                    onChange={this.handleChange}
                  />
                  :
                  <div className="progress">
                    <div className="indeterminate"></div>
                  </div>
                }
              </div>
            }

            <div className="right-align wordcounter">
              <p className="wordcount">
                {words} words
              </p>
            </div>
            <div className={save}></div>
            <div className={loading}>
              <div className="preloader-wrapper small active">
                <div className="spinner-layer spinner-green-only">
                  <div className="circle-clipper left">
                    <div className="circle"></div>
                  </div>
                  <div className="gap-patch">
                    <div className="circle">
                    </div>
                  </div>
                  <div className="circle-clipper right">
                    <div className="circle">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {stealthyModule}
        </div>
      </div>
    </div>
  );
}
}
