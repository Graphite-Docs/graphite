import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  handlePendingSignIn,
  signUserOut,
  redirectToSignIn,
} from 'blockstack';
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const blockstack = require("blockstack");

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

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

  componentDidUpdate() {
    window.$('ul.tabs').tabs('select_tab', 'tab_id');
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
    });
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.origin;
      });
    }
  }

  handleaddItem() {
    this.setState({ show: "hide" });
    this.setState({ hideButton: "hide", loading: "" })
    const rando = Date.now();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.id = rando;
    object.created = getMonthDayYear();

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
          // Materialize.toast('Could not find user', 2000);
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
          // Materialize.toast('Nothing shared', 2000);
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

  renderView() {
    const show = this.state.show;
    let contacts = this.state.filteredContacts;
    if(this.state.sharedWithMe === true) {
      return(
      <div className={show}>
        <div className="container center-align">
          <h3>Documents Shared With Me</h3>
          <h5>Select the contact who shared with you</h5>
        </div>

        <div className="container">

        {contacts.slice(0).reverse().map(contact => {
          let imageLink;
          let name;
          if(contact.img) {
            imageLink = contact.img;
          } else {
            imageLink = avatarFallbackImage;
          }

          if(contact.name) {
            name = contact.name;
          } else {
            name = "";
          }

            return (
              <ul className="collection">
                <li key={contact.contact} className="collection-item avatar">
                  <Link to={'/documents/shared/'+ contact.contact}>
                    <img src={imageLink} alt="Profile" className="circle" />
                    <span className="title">{contact.contact}</span>
                    <p>{name}</p>
                  </Link>
                </li>
              </ul>
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

        <div className="container">

        {contacts.slice(0).reverse().map(contact => {
          let imageLink;
          let name;
          if(contact.img) {
            imageLink = contact.img;
          } else {
            imageLink = avatarFallbackImage;
          }

          if(contact.name) {
            name = contact.name;
          } else {
            name = "";
          }

            return (
              <ul className="collection">
                <li key={contact.contact} className="collection-item avatar">
                  <Link to={'/documents/sent/'+ contact.contact}>
                    <img src={imageLink} alt="Profile" className="circle" />
                    <span className="title">{contact.contact}</span>
                    <p>{name}</p>
                  </Link>
                </li>
              </ul>
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
    console.log(loadUserData().username);
    return (
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
              <li><a href="/shared-docs">Shared Files</a></li>
              <li><a href="/export">Export All Data</a></li>
              <li className="divider"></li>
              <li><a onClick={ this.handleSignOut }>Sign out</a></li>
            </ul>
            <ul id="dropdown2" className="dropdown-content">
            <li><a href="/documents"><img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" className="dropdown-icon" /><br />Documents</a></li>
            <li><a href="/sheets"><img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" className="dropdown-icon-bigger" /><br />Sheets</a></li>
            <li><a href="/contacts"><img src="https://i.imgur.com/st3JArl.png" alt="contacts-icon" className="dropdown-icon" /><br />Contacts</a></li>
            <li><a href="/vault"><img src="https://i.imgur.com/9ZlABws.png" alt="vault-icon" className="dropdown-icon-file" /><br />Vault</a></li>
            </ul>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown2"><i className="material-icons apps">apps</i></a></li>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown1"><img alt="dropdown1" src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" /><i className="material-icons right">arrow_drop_down</i></a></li>
            </ul>
          </div>
        </nav>
        </div>
        <div className="shared-docs-page">
        <div className="share-buttons center-align">
          <ul className="tabs">
            <li className="tab col s3"><a onClick={() => this.setState({ sharedWithMe: true })} className="active" >Shared With Me</a></li>
            <li className="tab col s3"><a onClick={() => this.setState({ sharedWithMe: false })}>Shared With Others</a></li>
          </ul>
        </div>
        {this.renderView()}
        </div>
      </div>
    );
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
