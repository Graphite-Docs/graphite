import React, { Component } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import update from 'immutability-helper';
import RemoteStorage from 'remotestoragejs';
import Widget from 'remotestorage-widget';
const wordcount = require("wordcount");
const Font = ReactQuill.Quill.import('formats/font');
const { encryptECIES } = require('blockstack/lib/encryption');
const { decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
const remoteStorage = new RemoteStorage({logging: false});
const widget = new Widget(remoteStorage);
Font.whitelist = ['Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
ReactQuill.Quill.register(Font, true);

export default class TestDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team: [],
      value: [],
      contacts: [],
      title : "",
      content:"",
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
      show: "",
      pubKey: "",
      singleDoc: {},
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
      deleteIndex: ""
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
    this.quillRef = null;      // Quill instance
    this.reactQuillRef = null; // ReactQuill component
    this.addComment = this.addComment.bind(this);
    this.saveComment = this.saveComment.bind(this);
    this.handleCommentInput = this.handleCommentInput.bind(this);
    this.cancelComment = this.cancelComment.bind(this);
    this.resolveComment = this.resolveComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.saveNewCommentsArray = this.saveNewCommentsArray.bind(this);
  }



  componentDidMount() {
    let privateKey = loadUserData().appPrivateKey;
    const span = document.createElement("span");
    span.className += "ql-formats";
    const button = document.createElement("button");
    button.innerHTML = "&#x1F4AC;";
    button.className += "comment-button";
    span.appendChild(button);
    const commentButton = document.getElementsByClassName("comment-button");
    const element = document.getElementsByClassName("ql-toolbar")[0];
    element.appendChild(span);

    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'right', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    }
  );

    const thisFile = this.props.match.params.id;
    const fullFile = '/documents/' + thisFile + '.json';
    remoteStorage.access.claim('docs', 'rw');
    remoteStorage.caching.enable('/docs/');
    const client = remoteStorage.scope('/docs/');
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
    this.setState({ remoteTitle: file.data });
  });
  client.getFile('content.txt').then(file => {
    this.setState({ remoteContent: decryptECIES(privateKey, JSON.parse(file.data)) });
  });
  client.getFile('wordCount.txt').then(file => {
    this.setState({ remoteWords: decryptECIES(privateKey, JSON.parse(file.data)) });
  });
  client.getFile('id.txt').then(file => {
    this.setState({ remoteId: decryptECIES(privateKey, JSON.parse(file.data)) });
  });
  client.getFile('updated.txt').then(file => {
    this.setState({ remoteUpdated: decryptECIES(privateKey, JSON.parse(file.data)) });
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
          this.setState({ sharedWith: JSON.parse(fileContents || '{}') })
       })
        .catch(error => {
          console.log("shared with doc error: ")
          console.log(error);
        });

      getFile("documentscollection.json", {decrypt: true})
       .then((fileContents) => {
          this.setState({ value: JSON.parse(fileContents || '{}').value })
          let value = this.state.value;
          const thisDoc = value.find((doc) => { return doc.id == this.props.match.params.id});
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

        this.setState({
          title: JSON.parse(fileContents || '{}').title,
          content: JSON.parse(fileContents || '{}').content
       })
     })
      .catch(error => {
        console.log(error);
      });
      this.printPreview = () => {
        if(this.state.printPreview == true) {
          this.setState({printPreview: false});
        } else {
          this.setState({printPreview: true});
        }
      }
    }

  componentDidUpdate() {
    if(this.state.confirmAdd === true) {
      this.sharedInfo();
    }

    this.attachQuillRefs();
    document.getElementsByClassName("comment-button")[0].onclick = () => {
       var range = this.quillRef.getSelection();
       var text = this.quillRef.getText(range.index, range.length);
       this.quillRef.format('background', 'yellow');
       this.setState({ highlightedText: text, showCommentModal: "", selection: range });
    };
  }

  attachQuillRefs = () => {
   if (typeof this.reactQuillRef.getEditor !== 'function') return;
   this.quillRef = this.reactQuillRef.getEditor();
 }

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
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.words = wordcount(this.state.content);
    object.shared = month + "/" + day + "/" + year;
    this.setState({singlePublic: object})
    setTimeout(this.savePublic, 700);

  }

  stopSharing() {
    this.setState({ singlePublic: {}})
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
    var gaiaLink;
    const profile = loadUserData().profile;
    const apps = profile.apps;
    gaiaLink = apps["https://app.graphitedocs.com"];
    console.log("Shared: ")
    const user = loadUserData().username;
    const userShort = user.slice(0, -3);
    const params = this.props.match.params.id;
    const directory = 'public/';
    const file = directory + userShort + params + '.json'
    putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
      .then(() => {
        console.log("Shared Public Link")
        this.setState({gaiaLink: gaiaLink + file, publicShare: "", shareModal: "hide"});
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

  sharedInfo(){
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
        const objectTwo = {};
        objectTwo.contact = this.state.receiverID;
        this.setState({ shareFile: [...this.state.shareFile, object], sharedWith: [...this.state.sharedWith, objectTwo] });
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
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.id = parseInt(this.props.match.params.id, 10);
    object.updated = month + "/" + day + "/" + year;
    object.words = wordcount(this.state.content);
    this.setState({singleDoc: object});
    this.setState({autoSave: "Saving..."});
    const objectTwo = {};
    objectTwo.title = this.state.title;
    objectTwo.contacts = this.state.sharedWith;
    objectTwo.id = parseInt(this.props.match.params.id, 10);
    objectTwo.updated = month + "/" + day + "/" + year;
    objectTwo.words = wordcount(this.state.content);
    const index = this.state.index;
    const updatedDoc = update(this.state.value, {$splice: [[index, 1, objectTwo]]});
    this.setState({value: updatedDoc});
    this.autoSave();
    console.log("after save")

  };

  autoSave() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const file = this.props.match.params.id;
    const fullFile = '/documents/' + file + '.json';
    putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt: true})
      .then(() => {
        console.log("Autosaved");
        this.saveCollection();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
      remoteStorage.access.claim('docs', 'rw');
      remoteStorage.caching.enable('/docs/');
      const client = remoteStorage.scope('/docs/');
      const content = this.state.content;
      const title = this.state.title;
      const words = wordcount(this.state.content);
      const updated = month + "/" + day + "/" + year;
      const id = parseInt(this.props.match.params.id, 10);
      const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
      client.storeFile('text/plain', 'content.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(content))))
      .then(() => { console.log("Upload done") });
      client.storeFile('text/plain', 'title.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(title))))
      .then(() => { console.log("Upload done") });
      client.storeFile('text/plain', 'wordCount.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(words))))
      .then(() => { console.log("Upload done") });
      client.storeFile('text/plain', 'updated.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(updated))))
      .then(() => { console.log("Upload done") });
      client.storeFile('text/plain', 'id.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(updated))))
      .then(() => { console.log("Upload done") });
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
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.id = Date.now();
    object.commenter = loadUserData().username;
    object.date = month + '/' + day + '/' + year;
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
    const thisDoc = value.find((doc) => { return doc.id == this.state.commentId});
    let index = thisDoc && thisDoc.id;
    function findObjectIndex(doc) {
        return doc.id == index;
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


  print(){
    // const curURL = window.location.href;
    // window.replaceState(window.state, '', '/');
    // window.print();
    // window.replaceState(window.state, '', curURL);
    window.print();
  }

  renderView() {
    window.onload = () => {

    }
    this.state.commentId === "" ? console.log("no index set") : this.resolveComment();
    this.state.reviewSelection === "" ? console.log("no comment selected") : this.getCommentSelection();

    TestDoc.modules = {
      toolbar: [
        [{ font: [] }],
        [{ header: 1 }, { header: 2 }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ align: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        ['video'],
        ['image'],
        ['link'],
      ],
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
      }
    }
    // TestDoc.formats = [
    //   'header', 'font', 'size', 'color',
    //   'bold', 'italic', 'underline', 'strike', 'blockquote',
    //   'list', 'bullet', 'indent',
    //   'link', 'image', 'video'
    // ]
    const user = loadUserData().username;
    const words = wordcount(this.state.content.replace(/<(?:.|\n)*?>/gm, ''));
    const {listComments, showCommentModal, comments, remoteStorage, blogModal, loading, save, autoSave, shareModal, publicShare, show, contacts, hideStealthy, revealModule} = this.state
    const stealthy = (hideStealthy) ? "hide" : ""
    let blogTags = [
      "Technology",
      "Computers",
      "Decentralization",
      "Art"
    ]
    const remoteStorageActivator = remoteStorage === true ? "" : "hide";
    var content = "<p style='text-align: center;'>" + this.state.title + "</p>" + "<div style='text-indent: 30px;'>" + this.state.content + "</div>";
    var htmlString = window.$('<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">').html('<body>' +

    content +

    '</body>'

    ).get().outerHTML;

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
      const stealthyModule =  (<div className={stealthy}>
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
              <a onClick={this.handleBack} className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>

                <ul className="left toolbar-menu">
                <li className="document-title">{this.state.title.length > 15 ? this.state.title.substring(0,15)+"..." :  this.state.title}</li>
                <li><a className="small-menu muted">{autoSave}</a></li>
                </ul>
                <ul className="right toolbar-menu small-toolbar-menu auto-save">
                {this.state.notificationCount >0 ? <li><a><i className="small-menu red-text material-icons">notifications_active</i></a></li> : <li><a><i className="small-menu material-icons">notifications_none</i></a></li>}
                <li><a><i className="small-menu material-icons tooltipped dropdown-button" data-activates="dropdown2" data-position="bottom" data-delay="50" data-tooltip="Share">people</i></a></li>
                <li><a className="dropdown-button" data-activates="dropdown1"><i className="small-menu material-icons">more_vert</i></a></li>
                <li><a className="small-menu tooltipped stealthy-logo" data-position="bottom" data-delay="50" data-tooltip="Stealthy Chat" onClick={() => this.setState({hideStealthy: !hideStealthy})}><img className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/></a></li>
                </ul>

                {/*Share Menu Dropdown*/}
                <ul id="dropdown2"className="dropdown-content collection cointainer">
                <li><span className="center-align">Select a contact to share with</span></li>
                <a href="/contacts"><li><span className="muted blue-text center-align">Or add new contact</span></li></a>
                <li className="divider" />
                {contacts.slice(0).reverse().map(contact => {
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
                  <li><a onClick={() => this.setState({ remoteStorage: !remoteStorage })}>Remote Storage</a></li>
                  <li className="divider"></li>
                  <li><a onClick={this.print}>Print</a></li>
                  <li><a download={this.state.title + ".docx"}  href={dataUri}>Download</a></li>
                  <li className="divider"></li>
                  <li><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Comments</a></li>
                  <li><a href="#!">Tag</a></li>
                  <li><a href="#!">History</a></li>
                </ul>
              {/* End dropdown menu content */}

              {/*Show Comments Modal*/}
              <ul id="slide-out" className="comments-side-nav side-nav">
                {comments.slice(0).reverse().map(comment => {
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

                        <textarea defaultValue={this.state.commentInput} onChange={this.handleCommentInput} className="materialize-textarea black-text" placeholder="Your comment"/>

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
            <div id='remote-storage-element-id'></div>
          </div>
          {/*Remote storae widget*/}
          <div className="test-docs">
            <div className={docFlex}>
              <div className="double-space doc-margin">
              <h3>
                {this.state.title === "Untitled" ? <input className="doc-title" placeholder="Give it a title" type="text" onChange={this.handleTitleChange} /> : <input className="doc-title" placeholder="Title" type="text" value={this.state.title} onChange={this.handleTitleChange} />}
              </h3>

                  <ReactQuill
                    ref={(el) => { this.reactQuillRef = el }}
                    modules={TestDoc.modules}
                    id="textarea1"
                    className="materialize-textarea"
                    placeholder="Write something great"
                    value={this.state.content}
                    onChange={this.handleChange}
                    theme="bubble" />


              <div className="right-align wordcounter">
                <p className="wordcount">{words} words</p>
              </div>
              <div className={save}>
              </div>
              <div className={loading}>
              <div className="preloader-wrapper small active">
                <div className="spinner-layer spinner-green-only">
                  <div className="circle-clipper left">
                    <div className="circle"></div>
                  </div><div className="gap-patch">
                    <div className="circle"></div>
                  </div><div className="circle-clipper right">
                    <div className="circle"></div>
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

  render() {
    console.log(this.state.comments);
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
