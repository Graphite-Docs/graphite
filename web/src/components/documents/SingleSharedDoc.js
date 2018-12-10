import React, { Component } from "react";
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile,
  handlePendingSignIn,
} from 'blockstack';
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SingleSharedDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      sharedFile: [],
      title : "",
      user: "",
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
      hideButton: "",
      shareFile: [],
      show: "",
      img: avatarFallbackImage
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {

    getFile("documentscollection.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ value: JSON.parse(fileContents || '{}').value });
         this.setState({ user: JSON.parse(fileContents || '{}').user });
         this.refresh = setInterval(() => this.getOther(), 1000);
       } else {
         console.log("No docs");
       }
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

getOther() {
  let fileID = loadUserData().username;
  console.log(this.state.user);
  let fileString = 'shareddocs.json'
  let file = fileID.slice(0, -3) + fileString;
  const directory = '/shared/' + file;
  const options = { username: this.state.user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    getFile(directory, options)
     .then((fileContents) => {
       let privateKey = loadUserData().appPrivateKey;
        this.setState({ sharedFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
        let docs = this.state.sharedFile;
        const thisDoc = docs.find((doc) => { return doc.id.toString() === this.props.match.params.id}); //comparing strings
        let index = thisDoc && thisDoc.id;
        function findObjectIndex(doc) {
            return doc.id === index; //comparing numbers
        }
        this.setState({ content: thisDoc && thisDoc.content, title: thisDoc && thisDoc.title, index: docs.findIndex(findObjectIndex) })
     })
      .catch(error => {
        console.log(error);
      });
}

  handleTitleChange(e) {
    this.setState({
      title: e.target.value
    });
  }
  handleChange(value) {
      this.setState({ content: value })
    }

  handleIDChange(e) {
      this.setState({ receiverID: e.target.value })
    }

    handleaddItem() {
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
      setTimeout(this.saveNewFile, 500);

      this.setState({ show: "hide" });
      this.setState({ hideButton: "hide", loading: "" })
    }

    saveNewFile() {
      putFile("documentscollection.json", JSON.stringify(this.state), {encrypt:true})
        .then(() => {
          console.log("Saved!");
          this.saveNewSingleDoc();
        })
        .catch(e => {
          console.log("e");
          console.log(e);
        });
    }

    saveNewSingleDoc() {
      const file = this.state.tempDocId;
      const fullFile = '/documents/' + file + '.json'
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

  print(){
    const curURL = window.location.href;
    window.history.replaceState(window.history.state, '', '/');
    window.print();
    window.history.replaceState(window.history.state, '', curURL);
  }

  renderView() {
    const loading = this.state.loading;
    const hideButton = this.state.hideButton;
    return(
    <div>
    <div className="navbar-fixed toolbar">
      <nav className="toolbar-nav">
        <div className="nav-wrapper">
          <a href="/shared-docs" className="left brand-logo"><i className="material-icons">arrow_back</i></a>
          <ul className="left toolbar-menu">

            <li className={hideButton}><a onClick={this.handleaddItem}>Add to Documents</a></li>
          </ul>
        </div>
      </nav>
    </div>
    <div className="container docs">

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
  }

  render() {
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
