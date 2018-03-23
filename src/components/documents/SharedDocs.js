import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Profile from '../Profile';
import Signin from '../Signin';
import Header from '../Header';
import Collections from './Collections';
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
Font.whitelist = ['Ubuntu', 'Raleway', 'Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
ReactQuill.Quill.register(Font, true);

export default class SharedDocs extends Component {

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
      username: "",
      contacts: [],
      filteredContacts: [],
      title : "",
      content:"",
      updated: "",
      words: "",
      index: "",
      save: "",
      loading: "hide",
      printPreview: false,
      autoSave: "Saved",
      value: [],
      filteredValue: [],
      tempDocId: "",
      redirect: false,
      loading: "hide",
      receiverID: "",
      senderID: "",
      show: "",
      hide: "",
      hideButton: "",
      sharedWithMe: true
    }

    this.fetchData = this.fetchData.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.pullData = this.pullData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
  }

  componentDidMount() {
    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("Contacts are here");
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
         this.setState({ filteredContacts: this.state.contacts });
       } else {
         console.log("No contacts");
       }
     })
      .catch(error => {
        console.log(error);
      });

    getFile("documents.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ value: JSON.parse(fileContents || '{}').value });
         this.setState({filteredValue: this.state.value})
         // this.setState({ loading: "hide" });
       } else {
         console.log("Nothing to see here");
         // this.setState({ value: {} });
         // this.setState({ filteredValue: {} })
         // console.log(this.state.value);
         // this.setState({ loading: "hide" });
       }
     })
      .catch(error => {
        console.log(error);
      });
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
    });
  }

  handleaddItem() {
    this.setState({ show: "hide" });
    this.setState({ hideButton: "hide", loading: "" })
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const rando = Date.now();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.id = rando;
    object.created = month + "/" + day + "/" + year;

    this.setState({ value: [...this.state.value, object] });
    this.setState({ filteredValue: [...this.state.filteredValue, object] });
    this.setState({ tempDocId: object.id });
    this.setState({ loading: "" });
    // this.setState({ confirm: true, cancel: false });
    setTimeout(this.saveNewFile, 500);
    // setTimeout(this.handleGo, 700);
  }

  saveNewFile() {
    putFile("documents.json", JSON.stringify(this.state), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        window.location.replace("/documents");
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
      });
  }

  fetchData() {
    const username = this.state.senderID;

      lookupProfile(username, "https://core.blockstack.org/v1/names")
        .then((profile) => {
          this.setState({
            person: new Person(profile),
            username: username
          })
        })
        .catch((error) => {
          console.log('could not resolve profile')
          this.setState({ loading: "hide" });
          Materialize.toast('Could not find user', 2000);
          setTimeout(this.windowRefresh, 2000);
        })

      const options = { username: this.state.senderID, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}

      getFile('shared.json', options)
        .then((file) => {
          const doc = JSON.parse(file || '{}');
          console.log(doc.title);
          this.setState({ title: doc.title, content: doc.content, receiverID: doc.receiverID })
          this.setState({ show: "hide", loading: "hide", hideButton: ""});
        })
        .then(() => {
          this.setState({ isLoading: false })
        })
        .catch((error) => {
          console.log('could not fetch');
          this.setState({ loading: "hide" });
          Materialize.toast('Nothing shared', 2000);
          setTimeout(this.windowRefresh, 2000);
        })
    }

  windowRefresh() {
    window.location.reload(true);
  }


  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin
    redirectToSignIn(origin, origin + '/manifest.json', ['store_write', 'publish_data'])
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  handleIDChange(e) {
    this.setState({ senderID: e.target.value })
  }

  handleTitleChange(e) {
    this.setState({
      title: e.target.value
    });
  }

  handleChange(value) {
    this.setState({ content: value })
  }

  pullData() {

    <Redirect push to={fullLink} />
  }

  renderView() {
    const userData = blockstack.loadUserData();
    const person = new blockstack.Person(userData.profile);
    const show = this.state.show;
    const hideButton = this.state.hideButton;
    let value = this.state.value;
    console.log(loadUserData().username);
    const loading = this.state.loading;
    let contacts = this.state.filteredContacts;
    let link = '/documents/shared/';
    let user = this.state.senderID;
    let fullLink = link + user;
    if(this.state.sharedWithMe == true) {
      return(
      <div className={show}>
        <div className="container center-align">
          <h3>Documents Shared With Me</h3>
          <h5>Select the contact who shared with you</h5>
        </div>

        <div className="shared-contacts row">
        {contacts.slice(0).reverse().map(contact => {
            return (
              <div key={contact.contact} className="col s12 m6 l3">
                  <div className="card collections-card hoverable horizontal">
                  <Link to={'/documents/shared/'+ contact.contact} className="side-card doc-side">
                    <div className="card-image card-image-side doc-side">
                      <img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" />
                    </div>
                  </Link>
                    <div className="card-stacked">
                    <Link to={'/documents/shared/'+ contact.contact} className="black-text">
                      <div className="card-content">
                        <p className="title contacts-title">{contact.contact.length > 14 ? contact.contact.substring(0,14)+"..." :  contact.contact}</p>
                      </div>
                    </Link>
                      <div className="edit-card-action card-action">

                      </div>
                    </div>
                  </div>
              </div>
            )
          })
        }
        </div>
      </div>
    );
    } else {
      return (
      <div className={show}>
        <div className="container center-align">
          <h3>Documents Shared With Others</h3>
          <h5 >Select the contact you shared with</h5>
        </div>

        <div className="shared-contacts row">
        {contacts.slice(0).reverse().map(contact => {
            return (
              <div key={contact.contact} className="col s12 m6 l3">
                  <div className="card collections-card hoverable horizontal">
                  <Link to={'/documents/sent/'+ contact.contact} className="side-card doc-side">
                    <div className="card-image card-image-side doc-side">
                      <img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" />
                    </div>
                  </Link>
                    <div className="card-stacked">
                    <Link to={'/documents/sent/'+ contact.contact} className="black-text">
                      <div className="card-content">
                        <p className="title contacts-title">{contact.contact.length > 14 ? contact.contact.substring(0,14)+"..." :  contact.contact}</p>
                      </div>
                    </Link>
                      <div className="edit-card-action card-action">

                      </div>
                    </div>
                  </div>
              </div>
            )
          })
        }
        </div>
      </div>
    );
    }
  }


  render() {
    const userData = blockstack.loadUserData();
    const person = new blockstack.Person(userData.profile);
    const show = this.state.show;
    const hideButton = this.state.hideButton;
    let value = this.state.value;
    console.log(loadUserData().username);
    const loading = this.state.loading;
    let contacts = this.state.filteredContacts;
    let link = '/documents/shared/';
    let user = this.state.senderID;
    let fullLink = link + user;

    return (
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="http://www.iconsplace.com/icons/preview/white/pencil-256.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
              <li><a href="/profile">Profile</a></li>
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
        <div className="shared-docs-page">
        <div className="share-buttons center-align">
          <button onClick={() => this.setState({ sharedWithMe: true })} className="share-button">Shared with me</button>
          <button onClick={() => this.setState({ sharedWithMe: false })} className="share-button">Shared with others</button>
        </div>
        {this.renderView()}
        </div>
      </div>
    );
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.origin;
      });
    }
  }
}
//TODO add this back when you enable public sharing
// <div className="card center-align shared">
//   <h6>Enter the Blockstack user ID of the person who shared the file(s) with you</h6>
//   <input className="" placeholder="Ex: JohnnyCash.id" type="text" onChange={this.handleIDChange} />
//   <div className={hideButton}>
//     <Link to={fullLink}><button className="btn black">Find Files</button></Link>
//   </div>
//   <div className={loading}>
//     <div className="preloader-wrapper small active">
//         <div className="spinner-layer spinner-green-only">
//           <div className="circle-clipper left">
//             <div className="circle"></div>
//           </div><div className="gap-patch">
//             <div className="circle"></div>
//           </div><div className="circle-clipper right">
//             <div className="circle"></div>
//           </div>
//         </div>
//       </div>
//     </div>
// </div>
