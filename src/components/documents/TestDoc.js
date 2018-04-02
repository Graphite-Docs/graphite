import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Profile from "../Profile";
import Signin from "../Signin";
import Header from "../Header";
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack';
import update from 'immutability-helper';
const wordcount = require("wordcount");
const blockstack = require("blockstack");
const Quill = ReactQuill.Quill;
const Font = ReactQuill.Quill.import('formats/font');
const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
const timeout = null;
Font.whitelist = ['Ubuntu', 'Raleway', 'Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
ReactQuill.Quill.register(Font, true);

export default class TestDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      gaiaLink: ""
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
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("Contacts are here");
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
       } else {
         console.log("No contacts");
       }
     })
      .catch(error => {
        console.log(error);
      });

      getFile("shareddocsindex.json", {decrypt: true})
       .then((fileContents) => {
         if(fileContents) {
           console.log("Contacts are here");
           this.setState({ sharedIndex: JSON.parse(fileContents || '{}') });
         } else {
           console.log("No contacts");
         }
       })
        .catch(error => {
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

    const file = this.props.match.params.id;
    const fullFile = '/documents/' + file + '.json';
    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       console.log(fileContents);
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
    if(this.state.confirmAdd == true) {
      this.sharedInfo();
    }
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
        Materialize.toast(this.state.title + " is no longer publicly shared.", 4000);
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

    var first = JSON.stringify(apps).split('"http://localhost:8080":"')[1];
    var second = first.split('"')[0];
    gaiaLink = second;

    console.log("Shared: ")
    console.log(this.state.singlePublic);
    const user = loadUserData().username;
    const userShort = user.slice(0, -3);
    const params = this.props.match.params.id;
    const directory = 'public/';
    const file = directory + userShort + params + '.json'
    putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
      .then(() => {
        console.log("Shared Public Link")
        console.log(gaiaLink + file);
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
    Materialize.toast("Link copied to clipboard", 1000);
  }

  sharedInfo(){
    this.setState({ confirmAdd: false });
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const fileName = 'shareddocs.json'
    const file = userShort + fileName;
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
          Materialize.toast(this.state.receiverID + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
          this.setState({ shareModal: "hide", loading: "hide", show: "" });
        });
  }

  loadMyFile() {
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const fileName = 'shareddocs.json'
    const file = userShort + fileName;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}

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
        this.setState({ shareFile: [...this.state.shareFile, object] });
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
        Materialize.toast('Document shared with ' + this.state.receiverID, 4000);
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
          console.log("Shared encrypted file " + directory);
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
      shareModal: "hide"
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
    if(this.state.autoSave == "Saving") {
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
    object.id = parseInt(this.props.match.params.id);
    object.updated = month + "/" + day + "/" + year;
    object.words = wordcount(this.state.content);
    this.setState({singleDoc: object});
    this.setState({autoSave: "Saving..."});
    const objectTwo = {};
    objectTwo.title = this.state.title;
    // objectTwo.content = this.state.content;
    objectTwo.id = parseInt(this.props.match.params.id);
    objectTwo.updated = month + "/" + day + "/" + year;
    objectTwo.words = wordcount(this.state.content);
    const index = this.state.index;
    const updatedDoc = update(this.state.value, {$splice: [[index, 1, objectTwo]]});
    this.setState({value: updatedDoc});
    this.autoSave();
    console.log("after save")
    console.log(this.state.value);
  };

  autoSave() {
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


  print(){
    const curURL = window.location.href;
    history.replaceState(history.state, '', '/');
    window.print();
    history.replaceState(history.state, '', curURL);
  }

  renderView() {
    TestDoc.modules = {
      toolbar: [
        [{ 'header': '1'}, {'header': '2'}, { 'font': Font.whitelist }],,
        [{size: []}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'},
         {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image', 'video'],
        ['clean']
      ],
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
      }
    }
    /*
     * Quill editor formats
     * See https://quilljs.com/docs/formats/
     */
    TestDoc.formats = [
      'header', 'font', 'size',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image', 'video'
    ]
    const words = wordcount(this.state.content.replace(/<(?:.|\n)*?>/gm, ''));
    const loading = this.state.loading;
    const save = this.state.save;
    const autoSave = this.state.autoSave;
    const shareModal = this.state.shareModal;
    const publicShare = this.state.publicShare;
    const show = this.state.show;
    const contacts = this.state.contacts;
    var content = "<p style='text-align: center;'>" + this.state.title + "</p>" + "<div style='text-indent: 30px;'>" + this.state.content + "</div>";

    var htmlString = $('<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">').html('<body>' +

    content +

    '</body>'

    ).get().outerHTML;

    var htmlDocument = '<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><xml><word:WordDocument><word:View>Print</word:View><word:Zoom>90</word:Zoom><word:DoNotOptimizeForBrowser/></word:WordDocument></xml></head><body>' + content + '</body></html>';
    var dataUri = 'data:text/html,' + encodeURIComponent(htmlDocument);

    if(this.state.printPreview === true) {
      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a onClick={this.handleBack} className="arrow-back left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>


                <ul className="left toolbar-menu">
                  <li><a className="small-menu" onClick={this.printPreview}>Back to Editing</a></li>
                  <li><a onClick={this.print}><i className="material-icons">local_printshop</i></a></li>
                  <li><a download={this.state.title + ".doc"}  href={dataUri}><img className="wordlogo" src="https://png.icons8.com/metro/540//doc.png" /></a></li>
                  <li><a onClick={this.shareModal}><i className="material-icons">share</i></a></li>
                </ul>

            </div>
          </nav>
        </div>

        <div className={publicShare}>
        <div id="modal1" className="modal bottom-sheet">
          <div className="modal-content">

            <div className={show}>

              <button onClick={() => this.setState({ publicShare: "hide" })} className="btn grey">Done</button>
            </div>
            <div className={show}>
              <div className="container">
                <h4 className="contacts-share center-align">Public Link</h4>
                <p>Ask the person you are sharing with to visit <a href="https://app.graphitedocs.com/publicdoc" target="_blank">https://app.graphitedocs.com/publicdoc</a> and provide this link to them: </p>
                <p><input type="text" value={this.state.gaiaLink} id="gaia" /><button className="btn" onClick={this.copyLink}>Copy Link</button></p>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className={shareModal}>

          <div id="modal1" className="modal bottom-sheet">
            <div className="modal-content">
              <h4>Share</h4>
              <p>Select the person to share with or <a onClick={this.sharePublicly}>share publicly</a>*</p>
              <p><span className="note"><a onClick={() => Materialize.toast('Public files are not encrypted but will be available to anyone with the share link, even if they are not on Blockstack', 4000)}>*Learn more</a></span></p>
              <div className={show}>
                <button className="btn" onClick={this.stopSharing}>Stop Sharing Publicly</button>
                <button onClick={this.hideModal} className="btn grey">Cancel</button>
              </div>
              <div className={show}>
                <div className="container">
                  <h4 className="contacts-share center-align">Your Contacts</h4>
                  <ul className="collection cointainer">
                  {contacts.slice(0).reverse().map(contact => {
                      return (
                        <li key={contact.contact}className="collection-item avatar">
                          <a onClick={() => this.setState({ receiverID: contact.contact, confirmAdd: true })}>
                          <p><img src={contact.img} alt="avatar" className="circle" /></p>
                          <span className="title black-text">{contact.contact}</span>
                          </a>
                        </li>
                      )
                    })
                  }
                  </ul>
                </div>
              </div>
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
          </div>
        <div className="container docs">
          <div className="card doc-card">
            <div className="double-space doc-margin">
              <p className="center-align print-view">
              {this.state.title}
              </p>
              <div>
                <div
                  className="print-view no-edit"
                  dangerouslySetInnerHTML={{ __html: this.state.content }}
                />
              </div>
              </div>
              </div>
        </div>

        </div>
      );
    } else {
      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a onClick={this.handleBack} className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>

                <ul className="left toolbar-menu">
                <li><input className="print-title small-menu" placeholder="Title" type="text" value={this.state.title} onChange={this.handleTitleChange} /></li>
                <li><a className="small-menu" onClick={this.printPreview}>Export Options</a></li>
                </ul>
                <ul className="right toolbar-menu small-toolbar-menu auto-save">
                <li><a className="small-menu muted">{autoSave}</a></li>
                </ul>

            </div>
          </nav>
        </div>
          <div className="container docs">
            <div className="card doc-card">
              <div className="double-space doc-margin">
              <h4 className="align-left">

              </h4>

              <ReactQuill
                modules={TestDoc.modules}
                formats={TestDoc.formats}
                id="textarea1"
                className="materialize-textarea"
                placeholder="Write something great"
                value={this.state.content}
                onChange={this.handleChange} />

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
            </div>
          </div>
          </div>
      );
    }
  }

  render() {

    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
