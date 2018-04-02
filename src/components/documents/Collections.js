import React, { Component } from "react";
import { Link, Route, withRouter} from 'react-router-dom';
import { Redirect } from 'react-router';
import Profile from "../Profile";
import Signin from "../Signin";
import Header from "../Header";
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
} from 'blockstack';
const blockstack = require("blockstack");
const { getPublicKeyFromPrivate } = require('blockstack');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Collections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
  	  },
      value: [],
      singleDoc: {},
      filteredValue: [],
      tempDocId: "",
      redirect: false,
      loading: "",
      alert: "",
      migrationLength: 1,
      migrationCount: 0,
      migrationComplete: false,
      migrateTitle: "",
      migrateContent: "",
      migrateID: "",
      migrateUpdated: "",
      migrateWords: ""
    }
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
    this.saveNewSingleDoc = this.saveNewSingleDoc.bind(this);
    this.filterList = this.filterList.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
    const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey)
    putFile('key.json', JSON.stringify(publicKey), {encrypt: false})
    .then(() => {
        console.log("Saved!");
        console.log(JSON.stringify(publicKey));
      })
      .catch(e => {
        console.log(e);
      });
    getFile('docsmigration.json', {decrypt: true})
      .then((fileContents) => {
        this.setState({migrationComplete: JSON.parse(fileContents || '{}')})
      })
      .then(() => {
        if(this.state.migrationComplete != true) {
          this.migrateDocs();
        }
      })
      .catch(e => {
        console.log(e);
      });


    getFile("documentscollection.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log(JSON.parse(fileContents || '{}').value);
         this.setState({ value: JSON.parse(fileContents || '{}').value });
         this.setState({filteredValue: this.state.value})
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
  migrateDocs() {
    Materialize.toast("Please wait while Graphite is optimising file storage in the background. This will only happen once. When done, the page will refresh.", 10000);
    getFile("documents.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ oldValue: JSON.parse(fileContents || '{}').value });

       } else {
         console.log("No old docs found");
       }
     })
     .then(() => {
       if(this.state.oldValue.length > 0){
         this.setState({migrationLength: this.state.oldValue.length})
         this.startMigration();
       } else {
         console.log("nope")
       }
     })
      .catch(error => {
        console.log(error);
      });
  }

  startMigration() {
    console.log("starting");
    const files = this.state.oldValue;
    this.setState({
      migrateTitle: files[this.state.migrationCount].title,
      migrateContent: files[this.state.migrationCount].content,
      migrateID: files[this.state.migrationCount].id,
      migrateUpdated: files[this.state.migrationCount].updated,
      migrateWords: files[this.state.migrationCount].words
      })
    const migrationObject = {}
    migrationObject.id = this.state.migrateID;
    migrationObject.title = this.state.migrateTitle;
    migrationObject.content = this.state.migrateContent;
    migrationObject.updated = this.state.migrateUpdated;
    migrationObject.words = this.state.migrateWords;

    const migrationObjectTwo = {}
    migrationObjectTwo.id = this.state.migrateID;
    migrationObjectTwo.title = this.state.migrateTitle;
    migrationObjectTwo.updated = this.state.migrateUpdated;
    this.setState({ value: [...this.state.value, migrationObjectTwo]})
    this.setState({singleDoc: migrationObject})
    this.setState({tempDocId: migrationObject.id})
    //TODO Save this bad dog
    this.saveMigrationCollection();
  }

  saveMigrationCollection() {
    putFile("documentscollection.json", JSON.stringify(this.state), {encrypt:true})
      .then(() => {
        console.log("Migration Saved!");
        this.saveMigrationDoc();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveMigrationDoc() {
    console.log("Migration Length");
    console.log(this.state.oldValue.length);
    console.log("Migration Count");
    console.log(this.state.migrationCount);
    const file = this.state.tempDocId;
    const fullFile = '/documents/' + file + '.json'

    putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
      .then(() => {
        console.log("Saved Single Migration!");
        this.setState({migrationCount: this.state.migrationCount + 1})
        if(this.state.migrationCount < this.state.oldValue.length) {
          console.log(this.state.migrationCount);
          this.startMigration();
        } else {
          console.log("migration complete")
          this.migrationComplete();
        }
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  migrationComplete() {
    this.setState({migrationComplete: true})
    putFile('docsmigration.json', JSON.stringify(this.state.migrationComplete), {encrypt: true})
      .then(() => {
        console.log("migration file saved")
        window.location.reload(true);
      })
  }

  handleaddItem() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const rando = Date.now();
    const object = {};
    object.title = "Untitled";
    object.id = rando;
    object.created = month + "/" + day + "/" + year;
    const objectTwo = {}
    objectTwo.title = object.title;
    objectTwo.id = object.id;
    objectTwo.created = object.created;
    objectTwo.content = "";

    this.setState({ value: [...this.state.value, object] });
    this.setState({ filteredValue: [...this.state.filteredValue, object] });
    this.setState({ singleDoc: objectTwo });
    this.setState({ tempDocId: object.id });
    setTimeout(this.saveNewFile, 500);
  }
  filterList(event){
    var updatedList = this.state.value;
    updatedList = updatedList.filter(function(item){
      return item.title.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    this.setState({filteredValue: updatedList});
  }

  saveNewFile() {
    putFile("documentscollection.json", JSON.stringify(this.state), {encrypt:true})
      .then(() => {
        console.log("Saved Collection!");
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
        this.setState({ redirect: true });
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  handleClick() {
    this.setState({ alert: "hide" })
  }


  render() {
    const alert = this.state.alert;
    let value = this.state.filteredValue;
    const loading = this.state.loading;
    const link = '/documents/doc/' + this.state.tempDocId;
    if (this.state.redirect) {
      return <Redirect push to={link} />;
    } else {
      console.log("No redirect");
    }
    const userData = blockstack.loadUserData();
    const person = new blockstack.Person(userData.profile);

    return (
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="http://www.iconsplace.com/icons/preview/white/pencil-256.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
              <li><a href="/shared-docs">Shared Files</a></li>
              <li><a href="/export">Export All Data</a></li>
              <li className="divider"></li>
              <li><a href="#" onClick={ this.handleSignOut }>Sign out</a></li>
            </ul>
            <ul id="dropdown2" className="dropdown-content">
            <li><a href="/documents"><img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" className="dropdown-icon" /><br />Documents</a></li>
            <li><a href="/sheets"><img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" className="dropdown-icon-bigger" /><br />Sheets</a></li>
            <li><a href="/contacts"><img src="https://i.imgur.com/st3JArl.png" alt="contacts-icon" className="dropdown-icon" /><br />Contacts</a></li>
            <li><a href="/conversations"><img src="https://i.imgur.com/cuXF1V5.png" alt="conversations-icon" className="dropdown-icon-bigger" /><br />Conversations</a></li>
            <li><a href="/vault"><img src="https://i.imgur.com/9ZlABws.png" alt="vault-icon" className="dropdown-icon-file" /><br />Vault</a></li>
            </ul>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown2"><i className="material-icons apps">apps</i></a></li>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown1"><img src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" /><i className="material-icons right">arrow_drop_down</i></a></li>
            </ul>
          </div>
        </nav>
        </div>

        <div className="docs">
        <h3 className="container center-align">Documents</h3>
        <div className="">
          <form className="searchform">
          <fieldset className=" form-group searchfield">

          <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Documents" onChange={this.filterList}/>
          </fieldset>
          </form>
        </div>
          <div className="container">
            <div className={loading}>
              <div className="progress center-align">
                <p>Loading...</p>
                <div className="indeterminate"></div>
              </div>
            </div>
          </div>
        <div className="row">
          <div className="col s12 m6 l3">
            <a onClick={this.handleaddItem}><div className="card collections-card">
              <div className="center-align new-doc card-content">
                <p><i className="addDoc blue-text medium material-icons">add</i></p>
              </div>
              <h5 className="center-align black-text">New Document</h5>
            </div></a>
          </div>
          {value.slice(0).reverse().map(doc => {
              return (
                <div key={doc.id} className="col s12 m6 l3">
                    <div className="card collections-card hoverable horizontal">
                    <Link to={'/documents/doc/'+ doc.id} className="side-card black-text doc-side">
                      <div className="card-image card-image-side doc-side">
                        <img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" />
                      </div>
                    </Link>
                      <div className="card-stacked">
                      <Link to={'/documents/doc/'+ doc.id} className="black-text">
                        <div className="card-content">
                          <p className="title">{doc.title.length > 14 ? doc.title.substring(0,14)+"..." :  doc.title}</p>
                        </div>
                      </Link>
                        <div className="edit-card-action card-action">
                          <p><span className="muted muted-card">Last modified: {doc.updated}</span><Link to={'/documents/doc/delete/'+ doc.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></p>
                        </div>
                      </div>
                    </div>


                </div>
              )
            })
          }
        </div>
      </div>
      </div>
    );
  }
}
