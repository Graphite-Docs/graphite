import React, { Component } from "react";
// import ReactQuill, {Quill} from 'react-quill';
// import 'react-quill/dist/quill.bubble.css';
import { Link } from 'react-router-dom';
// import PublicDoc from '../PublicDoc.js'; //rendering this here, as a child of SingleDoc. will pass it props.

import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import update from 'immutability-helper';
import RemoteStorage from 'remotestoragejs';
import Widget from 'remotestorage-widget';
// import ImageResize from 'quill-image-resize-module';
// import TextEdit from '../TextEdit.js'; //this will render Yjs...
// import SummernotePublic from '../SummernotePublic.js'; //this will render Yjs...
import SummernotePublic from '../SummernotePublic.js'; //this will render Yjs...

// import ReactQuillTextEditor from '../ReactQuillTextEditor.js';

import Timer from '../Timer.js'; //trying this...
import axios from 'axios';
const wordcount = require("wordcount");
// const Font = ReactQuill.Quill.import('formats/font');
const { encryptECIES } = require('blockstack/lib/encryption');
const { decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
const remoteStorage = new RemoteStorage({logging: false});
const widget = new Widget(remoteStorage);
// Font.whitelist = ['Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
// ReactQuill.Quill.register(Font, true);
// Quill.register('modules/imageResize', ImageResize);


function getMonthDayYear() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const monthDayYear = month + "/" + day + "/" + year;
  return monthDayYear
}

//this function is for TextEdit...
function strip(html) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}




export default class SingleDoc extends Component {

  constructor(props) {
    super(props);
    this.state = {
      team: [],
      value: [],
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
      singleDocIsPublic: false, //this will be set to true by sharePublicly, and false by stopSharing
      confirmAdd: false,
      singlePublic: {},
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
      timerKey: "", //will update this to reset Timer
      yjsConnected: false,
      teamCount: 0,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeInTextEdit = this.handleChangeInTextEdit.bind(this);
    this.handleChangeInSummernotePublic = this.handleChangeInSummernotePublic.bind(this);
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
    this.quillRef = null;      // Quill instance
    this.reactQuillRef = null; // ReactQuill component
    this.addComment = this.addComment.bind(this);
    this.saveComment = this.saveComment.bind(this);
    this.handleCommentInput = this.handleCommentInput.bind(this);
    this.cancelComment = this.cancelComment.bind(this);
    this.resolveComment = this.resolveComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.saveNewCommentsArray = this.saveNewCommentsArray.bind(this);
    this.sendArticle = this.sendArticle.bind(this);
    this.sentToEditor = this.sentToEditor.bind(this);
    this.saveSend = this.saveSend.bind(this);
    this.getValueFromTextarea = this.getValueFromTextarea.bind(this);
    this.timeUp = this.timeUp.bind(this);
    this.getYjsConnectionStatus = this.getYjsConnectionStatus.bind(this);
    this.postToMedium = this.postToMedium.bind(this);
    this.loadPermissions = this.loadPermissions.bind(this);
  }


  componentWillMount() {
    console.warn('0. SingleDoc - componentWillMount, then render...')
  }

  componentDidMount() {
    console.warn('1. SingleDoc - componentDidMount')
    const user = 'admin.graphite';
    const options = { username: user, zoneFileLookupURL: 'https://core.blockstack.org/v1/names', decrypt: false}
    getFile('clientlist.json', options)
      .then((fileContents) => {
        if(JSON.parse(fileContents || '{}').length > 0) {
          this.setState({ clients: JSON.parse(fileContents || '{}') });
        } else {
          this.setState({ clients: [] });
        }

      })
      .then(() => {
        let user = loadUserData().username;
        let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
        let clientList;
        if(this.state.clients) {
          clientList = this.state.clients;
        } else {
          clientList = [];
        }
        let clientIDs =  clientList.map(a => a.clientID);
        if(clientIDs.includes(userRoot) || clientIDs.includes(user)) {
          this.loadPermissions();
        }
      })
      .catch(error => {
        console.log(error);
      });

    getFile("sentarticles.json", {decrypt: true})
    .then((fileContents) => {
      let articles = JSON.parse(fileContents || '{}');
      if(articles.length > 0) {
        this.setState({ sentArticles: JSON.parse(fileContents || '{}') });
      } else {
        this.setState({ sentArticles: [] });
      }
    })

    //This won't work yet
      // let substrings = this.state.clientList.name;
    // let substrings = [".id"];

    // if (substrings.some(function(v) { return loadUserData().username.indexOf(v) >= 0; })) {
    // if(loadUserData().username === "jehunter5811.id" || loadUserData().username === "khunter.id") {
    //   //Here we would load the correct permission file based on the root of the username (i.e. admin.graphite)
    //   //But for now, we will fake it to load permissions
    //   let clientType = "Journalism";
    //   if(clientType === "Journalism") {
    //     this.setState({ clientType: "Journalism", role: "Administrator"})
    //   }
    // }
    // else {
    // console.log("nope");
    // }
    //end of test code that won't work

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
    let privateKey = loadUserData().appPrivateKey;
    const span = document.createElement("span");
    span.className += "ql-formats";
    const button = document.createElement("button");
    button.innerHTML = "&#x1F4AC;";
    button.className += "comment-button";
    span.appendChild(button);
    // const commentButton = document.getElementsByClassName("comment-button");
    const element = document.getElementsByClassName("ql-toolbar")[0];
    // element.appendChild(span);

    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'right', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    });

    const thisFile = this.props.match.params.id;
    const fullFile = '/documents/' + thisFile + '.json';
    remoteStorage.access.claim(this.props.match.params.id, 'rw');
    remoteStorage.caching.enable('/' + this.props.match.params.id + '/');
    const client = remoteStorage.scope('/' + this.props.match.params.id + '/');
    widget.attach('remote-storage-element-id');
    remoteStorage.on('connected', () => {
      const userAddress = remoteStorage.remote.userAddress;
      console.debug(`${userAddress} connected their remote storage.`);
    })

    remoteStorage.on('network-offline', () => {
      console.debug(`We're offline now.`);
    })

    remoteStorage.on('network-online', () => {
      console.debug(`Hooray, we're back online.`);
    })

    client.getFile('title.txt').then(file => {
      if(file.data != null) {
        this.setState({ remoteTitle: file.data });
      }
    });

    client.getFile('content.txt').then(file => {
      if(file.data != null) {
        this.setState({ remoteContent: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });

    client.getFile('wordCount.txt').then(file => {
      if(file.data != null) {
        this.setState({ remoteWords: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });

    client.getFile('id.txt').then(file => {
      if(file.data != null) {
        this.setState({ remoteId: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });

    client.getFile('updated.txt').then(file => {
      if(file.data != null) {
        this.setState({ remoteUpdated: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });

    getFile(thisFile + 'comments.json', {decrypt: true})
    .then((fileContents) => {
      let comments = JSON.parse(fileContents || '{}');
      if(comments.length > 0) {
        this.setState({ comments: JSON.parse(fileContents || '{}') });
      } else {
        this.setState({ comments: [] });
      }
    })

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
      const thisDoc = value.find((doc) => { return doc.id === Number(this.props.match.params.id)});
      let index = thisDoc && thisDoc.id;
      // console.log('SingleDoc - getFile -> index is:', index); //index is same as thisDoc.id, a number
      function findObjectIndex(doc) {
        return doc.id === index;
      }
      this.setState({index: value.findIndex(findObjectIndex)})
    })
    .catch(error => {
      console.log(error);
    });

    getFile(fullFile, {decrypt: true})
    .then((fileContents) => {
      console.warn('***** SingleDoc - getFile -> fileContents: ', fileContents);
      console.log('SingleDoc - fileContents - JSON: ', JSON.parse(fileContents || '{}'));
      this.setState({
        title: JSON.parse(fileContents || '{}').title,
        content: JSON.parse(fileContents || '{}').content,
        tags: JSON.parse(fileContents || '{}').tags,
        idToLoad: JSON.parse(fileContents || '{}').id,
        singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
        docLoaded: true
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

    if(this.props.appState !== prevProps.appState) {
      console.warn('***** SingleDoc - componentDidMount, this.props.appState is now: ', this.props.appState)
    }

    // this.attachQuillRefs();
    // //TODO work on comment permission here
    // document.getElementsByClassName("comment-button")[0].onclick = () => {
    //   var range = this.quillRef.getSelection();
    //   var text = this.quillRef.getText(range.index, range.length);
    //   this.quillRef.format('background', 'yellow');
    //   this.setState({ highlightedText: text, showCommentModal: "", selection: range });
    // };
    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'right', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    });
  } //end of componentDidUpdate

  getValueFromTextarea(roomId) {
    console.log("getValueFromTextarea called!")
    // console.log('getValueFromTextarea - roomId is: ', roomId)
    var valueFromTextarea
    if (this.state.singleDocIsPublic !== true) { //could be false or undefined...
      valueFromTextarea = document.getElementById(roomId).value; //this works for TextEdit, but not for Summernote...
    }
    if (this.state.singleDocIsPublic === true) {
      valueFromTextarea = document.getElementsByClassName('note-editable')[0].innerHTML //for Summernote...
    }
    console.warn("getValueFromTextarea - valueFromTextarea is: ", valueFromTextarea)
    // console.log("getValueFromTextarea - typeof valueFromTextarea is: ", typeof valueFromTextarea)
    return valueFromTextarea
  }

  loadPermissions() {
    console.log("Loading permissions: ")
    let user = loadUserData().username;
    let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    let clientList;
    if(this.state.clients) {
      clientList = this.state.clients;
    } else {
      clientList = [];
    }

    let clientIDs = clientList.map(a => a.clientID);

    let clientTypeRoot = clientList.find(function (obj) { return obj.clientID === userRoot });
    let clientType = clientList.find(function (obj) { return obj.clientID === user })
    if(clientTypeRoot) {
      this.setState({ clientType: clientTypeRoot.type});
    } else if(clientType) {
      this.setState({clientType: clientType.type});
    }

    if(clientIDs.includes(userRoot)) {
      const options = {username: userRoot, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false };
      const privateKey = loadUserData().appPrivateKey;
      getFile(getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '.json', options)
       .then((fileContents) => {
         if(fileContents) {
           console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
           this.setState({
             team: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team,
             integrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team,
             editorView: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorView,
             editorName: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorName,
             editorRoles: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorRoles,
             editorPermissions: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorPermissions,
             editorIntegrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorIntegrations,
             editorPublish: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorPublish,
             journoView: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoView,
             journoName: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoName,
             journoRoles: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoRoles,
             journoPermissions: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoPermissions,
             journoIntegrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoIntegrations,
             journoPublish: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoPublish,
             accountSettings: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountSettings,
             lastUpdated: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated
           })
         } else {
           this.setState({
             team: [],
             integrations: [],
             editorView: false,
             editorRoles: false,
             editorPermissions: false,
             editorIntegrations: false,
             editorPublish: false,
             journoView: false,
             journoRoles: false,
             journoPermissions: false,
             journoIntegrations: false,
             journoPublish: false,
             accountSettings: "",
             lastUpdated: 0
           })
         }
       })
        .then(() => {
          let teamList;
          if(this.state.team) {
            teamList = this.state.team;
          } else {
            teamList = [];
          }
          let teamName = teamList.map(a => a.name);
          let teamMate = teamList.find(function (obj) { return obj.name === loadUserData().username })
          if(teamMate) {
            this.setState({ userRole: teamMate.role});
          }
        })
        .catch(error => {
          console.log(error);
        });
    } else if(clientIDs.includes(user)) {
      getFile('journoFileTest.json', {decrypt: true})
        .then((fileContents) => {
          if(fileContents) {
            console.log("Found your file");
            console.log(JSON.parse(fileContents || '{}'));
            this.setState({
              team: JSON.parse(fileContents || '{}').team,
              integrations: JSON.parse(fileContents || '{}').integrations || [],
              editorView: JSON.parse(fileContents || '{}').editorView,
              editorName: JSON.parse(fileContents || '{}').editorName,
              editorRoles: JSON.parse(fileContents || '{}').editorRoles,
              editorPermissions: JSON.parse(fileContents || '{}').editorPermissions,
              editorIntegrations: JSON.parse(fileContents || '{}').editorIntegrations,
              editorPublish: JSON.parse(fileContents || '{}').editorPublish,
              journoView: JSON.parse(fileContents || '{}').journoView,
              journoName: JSON.parse(fileContents || '{}').journoName,
              journoRoles: JSON.parse(fileContents || '{}').journoRoles,
              journoPermissions: JSON.parse(fileContents || '{}').journoPermissions,
              journoIntegrations: JSON.parse(fileContents || '{}').journoIntegrations,
              journoPublish: JSON.parse(fileContents || '{}').journoPublish,
              accountSettings: JSON.parse(fileContents || '{}').accountSettings,
              lastUpdated: JSON.parse(fileContents || '{}').lastUpdated
            })
          } else {
            console.log("No file created yet");
            this.setState({
              team: [],
              integrations: [],
              editorView: false,
              editorName: false,
              editorRoles: false,
              editorPermissions: false,
              editorIntegrations: false,
              editorPublish: false,
              journoView: false,
              journoName: false,
              journoRoles: false,
              journoPermissions: false,
              journoIntegrations: false,
              journoPublish: false,
              accountSettings: "",
              lastUpdated: 0
            })
          }
        })
        .then(() => {
          let teamList;
          if(this.state.team) {
            teamList = this.state.team;
          } else {
            teamList = [];
          }
          let teamName = teamList.map(a => a.name);
          let teamMate = teamList.find(function (obj) { return obj.name === loadUserData().username })
          if(teamMate) {
            this.setState({ userRole: teamMate.role});
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  resetTimer() { //calling setState below will rerender SingleDoc, as will any other setState calls...
    this.setState({ timerKey: Math.random() }); //reset timerKey, which will reset Timer component
  }

  timeUp() {
    console.log('timeUp - timer is at zero!')
    if (this.state.singleDocIsPublic === true && this.state.yjsConnected === true) {
      let roomId = this.state.idToLoad.toString()
      let valueFromTextarea = this.getValueFromTextarea(roomId)
      // add condition: if valueFromTextarea is the same as this.state.content, meaning no changes have been made in publicDoc, simply reset timer...
      if (valueFromTextarea === this.state.content) {
        console.warn("timeUp - NO updates have been made in PublicDoc, so calling resetTimer...")
        setTimeout( () => {
          this.resetTimer()
        }, 1000); //call this after one second.
      }
      // else, valueFromTextarea is different from this.state.content, so do the below...
      if (valueFromTextarea !== this.state.content) {
        console.warn("timeUp - updates have been made in PublicDoc - setting state in SingleDoc...")
        this.setState({ content: valueFromTextarea}) //update the content based on what's in the textarea
        console.log('timeUp - calling handleAutoAdd...')
        this.handleAutoAdd() //call handleAutoAdd to save SingleDoc
        setTimeout( () => {
          this.resetTimer()
        }, 1000); //call this after one second.
      }
    }
  }

  getYjsConnectionStatus(status) {
    console.warn('SingleDoc - getYjsConnectionStatus is: ', status)
    this.setState({ yjsConnected: status}) //set status of yjsConnected based on connection.connected in Yjs... then if yjsConnect is true, start timer in Timer component. if not connected, don't start timer.
  }

  // attachQuillRefs = () => {
  //   if (typeof this.reactQuillRef.getEditor !== 'function') return;
  //   this.quillRef = this.reactQuillRef.getEditor();
  // }

  insertText = () => {
    var range = this.quillRef.getSelection();
    var text = this.quillRef.getText(range.index, range.length);
    this.setState({ highlightedText: text, showCommentModal: "", selection: range });
  }

  cancelComment = () => {
    this.quillRef.format('background', 'white');
    this.setState({showCommentModal: "hide", commentInput: "" });
  }

  sharePublicly() {
    console.warn("sharePublicly called!")
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.words = wordcount(this.state.content);
    object.shared = getMonthDayYear();
    this.setState({
      singlePublic: object,
      singleDocIsPublic: true
    })
    setTimeout(this.savePublic, 700); //does this need to be on a setTimeout? can it happen right away???
  }

  stopSharing() {
    this.setState({
      singlePublic: {},
      singleDocIsPublic: false
    })
    setTimeout(this.saveStop, 700);
  }

  saveStop() {
    const user = loadUserData().username;
    const userShort = user.slice(0, -3);
    const params = this.props.match.params.id;
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

  savePublic() {
    console.log("SingleDoc - savePublic called....")
    console.log("SingleDoc - this.state.singleDocIsPublic is: ", this.state.singleDocIsPublic)
    const user = loadUserData().username;
    // const userShort = user.slice(0, -3);
    const id = this.props.match.params.id
    const link = 'https://app.graphitedocs.com/shared/docs/' + user + '-' + id;
    console.log("savePublic - savePublic link: ", link);
    const params = this.props.match.params.id;
    const directory = 'public/';
    const file = directory + id + '.json'
    putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
    .then(() => {
      console.log("Shared Public Link")
      this.setState({gaiaLink: link, publicShare: "", shareModal: "hide"});
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
      this.setState({ shareFile: [...this.state.shareFile, object] });
      setTimeout(this.shareDoc, 700);
    });
  }

  shareDoc() {
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
    this.setState({
      title: e.target.value
    });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.handleAutoAdd, 1500)
  }

  handleChange(value) {
    this.setState({ content: value });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.handleAutoAdd, 1500)
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

  handleAutoAdd() {
    console.warn('calling handleAutoAdd!!!')
    if (this.state.singleDocIsPublic === true) {
      this.sharePublicly()
    }
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.id = parseInt(this.props.match.params.id, 10);
    object.updated = getMonthDayYear();
    object.sharedWith = [];
    object.singleDocIsPublic = this.state.singleDocIsPublic; //true or false...
    object.author = loadUserData().username;
    // object.sharedWith = this.state.sharedWith;
    object.words = wordcount(this.state.content);
    object.tags = this.state.tags;
    this.setState({singleDoc: object});
    this.setState({autoSave: "Saving..."});
    const objectTwo = {};
    objectTwo.title = this.state.title;
    objectTwo.id = parseInt(this.props.match.params.id, 10);
    objectTwo.updated = getMonthDayYear();
    objectTwo.words = wordcount(this.state.content);
    objectTwo.sharedWith = [];
    objectTwo.singleDocIsPublic = this.state.singleDocIsPublic; //true or false...
    objectTwo.author = loadUserData().username;
    // objectTwo.sharedWith = this.state.sharedWith;
    objectTwo.tags = this.state.tags;
    const index = this.state.index;
    const updatedDoc = update(this.state.value, {$splice: [[index, 1, objectTwo]]}); //splice is replacing 1 element at index position with objectTwo
    this.setState({value: updatedDoc});
    this.autoSave();
    console.log("after save")
  };

  autoSave() {
    const file = this.props.match.params.id;
    const fullFile = '/documents/' + file + '.json';
    function lengthInUtf8Bytes(str) {
      // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
      var m = encodeURIComponent(str).match(/%[89ABab]/g);
      return str.length + (m ? m.length : 0);
    }
    console.log("SingleDoc - lengthInUtf8Bytes(this.state.singleDoc): ", lengthInUtf8Bytes(this.state.singleDoc))
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
    const client = remoteStorage.scope('/' + this.props.match.params.id + '/');
    const content = this.state.content;
    const title = this.state.title;
    const singleDocIsPublic = (this.state.singleDocIsPublic === true ? "true" : "false"); //true or false, as a string...
    const words = wordcount(this.state.content);
    const updated = getMonthDayYear();
    const id = parseInt(this.props.match.params.id, 10);
    const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    client.storeFile('text/plain', 'content.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(content))))
    .then(() => { console.log("Upload done - content") });
    client.storeFile('text/plain', 'title.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(title))))
    .then(() => { console.log("Upload done - title") });
    client.storeFile('text/plain', 'singleDocIsPublic.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(singleDocIsPublic))))
    .then(() => { console.log("Upload done - singleDocIsPublic") });
    client.storeFile('text/plain', 'wordCount.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(words))))
    .then(() => { console.log("Upload done - wordCount") });
    client.storeFile('text/plain', 'updated.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(updated))))
    .then(() => { console.log("Upload done - updated") });
    client.storeFile('text/plain', 'id.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(id))))
    .then(() => { console.log("Upload done - id") });
  }

  saveCollection() {
    putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
    .then(() => {
      this.setState({autoSave: "Saved"});
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  }

  handleCommentInput(e) {
    this.setState({ commentInput: e.target.value });
  }

  addComment() {
    const object = {};
    object.id = Date.now();
    object.commenter = loadUserData().username;
    object.date = getMonthDayYear();
    object.selection = this.state.selection;
    object.highlightedText = this.state.highlightedText;
    object.comment = this.state.commentInput;
    this.setState({ comments: [...this.state.comments, object ]});
    setTimeout(this.saveComment, 700);
  }

  saveComment() {
    const file = this.props.match.params.id;
    const fullFile = file + 'comments.json';
    putFile(fullFile, JSON.stringify(this.state.comments), {encrypt: true})
    .then(() => {
      this.setState({
        showCommentModal: "hide",
        commentInput: "",
        highlightedText: "",
        selection: ""
      });
      window.Materialize.toast("Comment saved", 3000);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  }

  getCommentSelection() {
    this.quillRef.setSelection(this.state.reviewSelection);
    window.$('.button-collapse').sideNav('hide');
  }

  resolveComment() {
    this.quillRef.setSelection(this.state.reviewSelection);
    let value = this.state.comments;
    const thisDoc = value.find((doc) => { return doc.id === this.state.commentId});
    let index = thisDoc && thisDoc.id;
    function findObjectIndex(doc) {
      return doc.id === index;
    }
    this.setState({ deleteIndex: value.findIndex(findObjectIndex) });
    this.deleteComment();
  }

  deleteComment() {
    // var text = this.quillRef.getText(range.index, range.length);
    this.quillRef.format('background', 'white');
    const updatedComments = update(this.state.comments, {$splice: [[this.state.deleteIndex, 1]]});
    this.setState({comments: updatedComments, commentId: "" });
    window.$('.button-collapse').sideNav('hide');
    setTimeout(this.saveNewCommentsArray, 500);
  }

  saveNewCommentsArray() {
    const file = this.props.match.params.id;
    const fullFile = file + 'comments.json';
    putFile(fullFile, JSON.stringify(this.state.comments), {encrypt: true})
    .then(() => {
      this.setState({
        showCommentModal: "hide",
        commentInput: "",
        highlightedText: "",
        selection: ""
      });
      window.Materialize.toast("Resolved!", 3000);
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

  saveSend() {
    putFile("sentarticles.json", JSON.stringify(this.state.sentArticles), {encrypt: true})
    .then(() => {
      this.sentToEditor();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  }

  sentToEditor() {

    if(this.state.teamCount < this.state.team.length) {
      //Here we will want to cycle through the team file and send/encrypt the file to all teammates
      const user = this.state.team[this.state.teamCount].name;
      // const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

      const publicKey = this.state.team[this.state.teamCount].key;
      const data = this.state.sentArticles;
      const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
      const file = user + 'submitted.json';
      putFile(file, encryptedData, {encrypt: false})
        .then(() => {
          console.log("Sent!");
          window.Materialize.toast('Article Submitted', 4000);
          this.setState({ teamCount: this.state.teamCount + 1 });
          this.sentToEditor();
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      console.log("no more teammates");
      let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
      const options = { username: userRoot, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false }
      getFile('key.json', options)
        .then((fileContents) => {
          this.setState({ pubKey: JSON.parse(fileContents || '{}')});
        })
        .then(() => {
          this.saveToAdmin();
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  saveToAdmin() {
    const userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    const publicKey = this.state.pubKey;
    const data = this.state.sentArticles;
    const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
    const file = userRoot + 'submitted.json';
    putFile(file, encryptedData, {encrypt: false})
      .then(() => {
        console.log("Sent to admin!");
        this.setState({ teamCount: 0 });
      })
      .catch(e => {
        console.log(e);
      });
  }

  postToMedium() {
    const user = "jehunter5811.id";
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

    getFile('key.json', options)
      .then((file) => {
        this.setState({ pubKey: JSON.parse(file)})
        console.log("Step One: PubKey Loaded");
      })
        .then(() => {
          const publicKey = this.state.pubKey;
          const data = this.state.singleDoc;
          const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
          axios.post("https://hooks.zapier.com/hooks/catch/2565501/w9vl8j/", encryptedData)
          .then(function (response) {
            console.log(response);

          })
          .catch(function (error) {
            console.log(error);
          });
        })
        .catch(error => {
          console.log("No key: " + error);
          window.Materialize.toast(this.state.receiverID + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
          this.setState({ shareModal: "hide", loading: "hide", show: "" });
        });
  }

  //this function is for SummernotePublic...
  handleChangeInSummernotePublic(contents) { //calling this on change in textarea...
    console.log('****** -->> handleChangeInSummernotePublic called, contents is: ', contents)
    this.resetTimer()
    var updateString = contents;
    this.setState({ content: updateString });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.handleAutoAdd, 1500);
  }

  //this function is for TextEdit...
  handleChangeInTextEdit(event) { //calling this on change in textarea...
    console.log('****** -->> handleChangeInTextEdit called, event is: ', event)
    this.resetTimer()
    var updateString = event.target.value
    this.setState({ content: updateString });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.handleAutoAdd, 1500)
  }


  render() {
    console.log("SINGLE DOC RENDER...")
    if (this.state.docLoaded === true) {
      // console.log("SingleDoc - this.props: ", this.props)
      console.warn("SingleDoc - this.state: ", this.state)
      // console.warn("SingleDoc - 1) this.state.singleDoc.content: ", this.state.singleDoc.content);
      // console.warn("SingleDoc - 2) this.state.singlePublic.content: ", this.state.singlePublic.content);

      // console.log("Title: ");
      // console.log(this.state.title);
      // console.log("Content: ");
      // console.log(this.state.content);
      // console.log("SingleDoc - this.state.team: ", this.state.team);
      // this.state.enterpriseUser === true && this.state.team.length === 0 ? this.loadTeamFile() : console.log("no team");

      //QUESTION: do we need these three lines? looks like they console.log the messages every time SingleDoc renders...
      this.state.commentId === "" ? console.log("1. no index set") : this.resolveComment();
      this.state.reviewSelection === "" ? console.log("2. no comment selected") : this.getCommentSelection();
      this.state.send === false ? console.log("3. No article sent") : this.sendArticle();
    } else {
      console.log("SingleDoc - docLoaded: ", this.state.docLoaded)
    }

    //QUESTION: can SingleDoc.modules below be deleted? looks like it was for Quill... - ER 7/10/18
    // SingleDoc.modules = {
    //   toolbar: [
    //     //[{ font: Font.whitelist }],
    //     [{ header: 1 }, { header: 2 }],
    //     [{ header: [1, 2, 3, 4, 5, 6, false] }],
    //     [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    //     [{ align: [] }],
    //     ['bold', 'italic', 'underline', 'strike'],
    //     ['blockquote', 'code-block'],
    //     [{ script: 'sub' }, { script: 'super' }],
    //     [{ indent: '-1' }, { indent: '+1' }],
    //     [{ color: [] }, { background: [] }],
    //     ['video'],
    //     ['image'],
    //     ['link'],
    //   ],
    //   imageResize: {
    //     modules: ['Resize', 'DisplaySize']
    //   },
    //   clipboard: {
    //     // toggle to add extra line breaks when pasting HTML:
    //     matchVisual: false,
    //   }
    // }

    // const user = loadUserData().username;
    let words;
    if(this.state.content) {
      words = wordcount(this.state.content.replace(/<(?:.|\n)*?>/gm, ''));
    } else {
      words = 0;
    }

    const { team, publicShare, showCommentModal, comments, remoteStorage, loading, save, autoSave, contacts, hideStealthy, revealModule} = this.state
    const stealthy = (hideStealthy) ? "hide" : ""
    let teamName = team.map(a => a.name);
    // console.log('teamName is: ', teamName)

    // let blogTags = [
    //   "Technology",
    //   "Computers",
    //   "Decentralization",
    //   "Art"
    // ]
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
                {/*this.state.notificationCount >0 ? <li><a><i className="small-menu red-text material-icons">notifications_active</i></a></li> : <li><a><i className="small-menu material-icons">notifications_none</i></a></li>*/}
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
                <li><span className="center-align">Select a contact to share with</span></li>
                <a href="/contacts"><li><span className="muted blue-text center-align">Or add new contact</span></li></a>
                <li className="divider" />
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
                  <li>
                    <a onClick={() => this.setState({ remoteStorage: !remoteStorage })}>Remote Storage</a>
                  </li>
                  <li className="divider"></li>
                  <li>
                    <a onClick={this.print}>Print</a>
                  </li>
                  <li>
                    <a download={this.state.title + ".doc"} href={dataUri}>Download</a>
                  </li>
                  <li>
                    <a onClick={this.sharePublicly}>Public Link</a>
                  </li>
                  {
                    (this.state.clientType === "Newsroom") ?
                    <li>
                      <a onClick={() => this.setState({send: true})}>Submit Article</a>
                    </li>
                    :
                    <li className="hide"/>
                  }
                  {
                    (loadUserData().username === "jehunter5811.id")
                    ?
                    <li>
                      <a onClick={this.postToMedium}>Post to Medium</a>
                    </li>
                    : <li className="hide"/>
                  }
                  <li className="divider"></li>
                  <li>
                    <a data-activates="slide-out" className="menu-button-collapse button-collapse">Comments</a>
                  </li>
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
                        <button onClick={() => this.setState({ reviewSelection: comment.selection })} className="black-text btn-flat">Review</button>
                        <button onClick={() => this.setState({ reviewSelection: comment.selection, commentId: comment.id })} className="btn-flat">Resolve</button>
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
        {/* <div className={publicShare}>
          <div id="modal1" className="project-page-modal modal">
            <div className="modal-content">
              <h4>Share Publicly</h4>
              <p>This data is not encrypted and can be accessed by anyone with the link below.</p>
              <div>
                <p>{this.state.gaiaLink}</p>
              </div>
            </div>
            <div className="modal-footer">
              <a onClick={() => this.setState({ publicShare: "hide"})}
                className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
              </div>
            </div>
          </div> */}
          {/* End Public Link Modal */}
          {/* commenting out modal above, showing this message on the page for now instead... */}


<div className="test-docs">
  <div className={docFlex}>
    <div className="double-space doc-margin">

      <p>
        <span style={{background: 'yellow'}}>Single Doc:</span> {this.state.idToLoad}
      </p>

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

      <p>
        {/* <span style={this.state.singleDocIsPublic === true ? {border: "2px solid orange"} : {border: "2px solid blue"}}> */}
        <span>
          Privacy settings: {(this.state.singleDocIsPublic === true) ? "This document is being shared publicly." : "Private. No one can see this document but you."}
        </span>
      </p>
      {/* <p style={this.state.singleDocIsPublic === true ? {border: "2px solid orange"} : {border: "2px solid blue"}}>
        this.state.singleDocIsPublic: {(this.state.singleDocIsPublic === true) ? "true" : "false"}
      </p> */}

      {/* <p>
        commenting out modal above, showing this message on the page for now instead...
      </p> */}
      {/* Public Link NO Modal */}
      {/* Public Link NO Modal */}
      <div className={publicShare}>
        <h4>Share Publicly</h4>
        <p>This data is not encrypted and can be accessed by anyone with the link below.</p>
        {/* <p>{this.state.gaiaLink}</p> */}
        <Link to={this.state.gaiaLink} target="_blank">{this.state.gaiaLink}</Link>
      </div>
      {/* End Public Link NO Modal */}
      {/* End Public Link NO Modal */}

      {
        (this.state.singleDocIsPublic === true && this.state.value) //making sure we have this pass to match for PublicDoc
        ?
        <div>
          {/* <p>
            (TextEdit will be rendered here, as a child of SingleDoc...)
          </p> */}
          <p style={{border: "2px solid green"}}>
            (SummernotePublic will be rendered here, as a child of SingleDoc...)
          </p>

          <p style={{border: "2px solid purple"}}>
            Websockets: &nbsp;
            {
              (this.state.yjsConnected === true) ?
              <span style={{color: "white", background: "green"}}>connected</span>
              :
              <span style={{color: "red"}}>no connection</span>
            }
          </p>
          {/* <div style={{display: "none"}}> */}
          <div>
            <Timer
              key={this.state.timerKey}
              docLoaded={this.state.docLoaded} //this is set by getFile
              timeUp={this.timeUp} //passing this function...
              yjsConnected={this.state.yjsConnected} //this is set by getYjsConnectionStatus
            />
          </div>

          {
            (this.state.docLoaded === true) ?
            <SummernotePublic
              // roomId={this.state.idToLoad} //this is a string!
              // docLoaded={this.state.docLoaded} //this is set by loadDoc
              // value={this.state.content}
              // onChange={this.handleChange}
              roomId={this.state.idToLoad.toString()} //this needs to be a string!
              docLoaded={this.state.docLoaded} //this is set by getFile
              // value={strip(this.state.content)} //stripping html tags from content received from loadDoc...
              value={this.state.content} //stripping html tags from content received from loadDoc...
              // onChange={this.handleChangeInTextEdit}
              onChange={this.handleChangeInSummernotePublic}
              getYjsConnectionStatus={this.getYjsConnectionStatus} //passing this through TextEdit to Yjs
              yjsConnected={this.state.yjsConnected} //true or false, for TextEdit
              singleDocIsPublic={this.state.singleDocIsPublic} //only calling on Yjs if singleDocIsPublic equals true
            />
            //<TextEdit
              // roomId={this.state.idToLoad.toString()} //this needs to be a string!
              // docLoaded={this.state.docLoaded} //this is set by getFile
              // value={strip(this.state.content)} //stripping html tags from content received from loadDoc...
              // onChange={this.handleChangeInTextEdit}
              // getYjsConnectionStatus={this.getYjsConnectionStatus} //passing this through TextEdit to Yjs
              // yjsConnected={this.state.yjsConnected} //true or false, for TextEdit
            // />
            :
            "Loading..." //replace this with a Materialize loading spinner icon?
          }
        </div>
        :
        <div>
          {/* <p>
            (else, singleDoc is not public, so returning a private doc.)
          </p> */}
          {
            (this.state.docLoaded === true) ?
            <SummernotePublic
              // roomId={this.state.idToLoad} //this is a string!
              // docLoaded={this.state.docLoaded} //this is set by loadDoc
              // value={this.state.content}
              // onChange={this.handleChange}
              roomId={this.state.idToLoad.toString()} //this needs to be a string!
              docLoaded={this.state.docLoaded} //this is set by getFile
              // value={strip(this.state.content)} //stripping html tags from content received from loadDoc...
              value={this.state.content} //NOT stripping html tags from content received from loadDoc...
              // onChange={this.handleChangeInTextEdit}
              onChange={this.handleChangeInSummernotePublic}
              getYjsConnectionStatus={this.getYjsConnectionStatus} //passing this through TextEdit to Yjs
              yjsConnected={this.state.yjsConnected} //true or false, for TextEdit
            />
            //<ReactQuillTextEditor
              // roomId={this.state.idToLoad.toString()} //this needs to be a string!
              // docLoaded={this.state.docLoaded}
              // value={this.state.content}
              // onChange={this.handleChange}
            // />
            :
            "Loading..." //replace this with a Materialize loading spinner icon?
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
