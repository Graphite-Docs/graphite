import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  loadUserData,
  Person,
  getFile
} from 'blockstack';
const blockstack = require("blockstack");
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedVault extends Component {

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
      grid: [
        []
      ],
      updated: "",
      words: "",
      index: "",
      save: "",
      loading: "hide",
      printPreview: false,
      autoSave: "Saved",
      senderID: "",
      sheets: [],
      filteredValue: [],
      tempDocId: "",
      redirect: false,
      receiverID: "",
      show: "",
      hide: "",
      hideButton: "",
      sharedWithMe: true
    }
    this.handleIDChange = this.handleIDChange.bind(this);
    this.pullData = this.pullData.bind(this);
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
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
    });
  }

  windowRefresh() {
    window.location.reload(true);
  }

  handleIDChange(e) {
    this.setState({ senderID: e.target.value })
  }

  pullData() {
    this.fetchData();
    this.setState({ hideButton: "hide", loading: "" });
  }

  renderView() {
    const show = this.state.show;
    console.log(loadUserData().username);
    const loading = this.state.loading;
    let contacts = this.state.filteredContacts;
    let link = '/sheets/shared/';
    let user = this.state.senderID;
    const userData = blockstack.loadUserData();

    if(this.state.sharedWithMe === true) {
      return(
      <div className={show}>
        <div className="container center-align">
          <h3>Files Shared With Me</h3>
          <h5>Select the contact who shared with you</h5>
        </div>

        <div className="shared-contacts row">
        {contacts.slice(0).reverse().map(contact => {
            return (
              <div key={contact.contact} className="col s12 m6 l3">
                  <div className="card collections-card hoverable horizontal">
                  <Link to={'/vault/shared/'+ contact.contact} className="side-card file-side">
                    <div className="card-image card-image-side file-side">
                      <img src="https://i.imgur.com/9ZlABws.png" alt="files icon" />
                    </div>
                  </Link>
                    <div className="card-stacked">
                    <Link to={'/vault/shared/'+ contact.contact} className="black-text">
                      <div className="card-content">
                        <p className="title contacts-title">{contact.contact.length > 11 ? contact.contact.substring(0,11)+"..." :  contact.contact}</p>
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
          <h3>Files Shared With Others</h3>
          <h5 >Select the contact you shared with</h5>
        </div>

        <div className="shared-contacts row">
        {contacts.slice(0).reverse().map(contact => {
            return (
              <div key={contact.contact} className="col s12 m6 l3">
                  <div className="card collections-card hoverable horizontal">
                  <Link to={'/vault/sent/'+ contact.contact} className="side-card file-side">
                    <div className="card-image card-image-side file-side">
                      <img src="https://i.imgur.com/9ZlABws.png" alt="sheets-icon" />
                    </div>
                  </Link>
                    <div className="card-stacked">
                    <Link to={'/vault/sent/'+ contact.contact} className="black-text">
                      <div className="card-content">
                        <p className="title contacts-title">{contact.contact.length > 11 ? contact.contact.substring(0,11)+"..." :  contact.contact}</p>
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
      console.log(loadUserData().username);
      let link = '/vault/shared/';
      let user = this.state.senderID;
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
                <li><a href="/profile">Profile</a></li>
                <li><a href="/shared-sheets">Shared Files</a></li>
                <li><a href="/export">Export All Data</a></li>
                <li className="divider"></li>
                <li><a onClick={ this.handleSignOut }>Sign out</a></li>
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

        </div>
        {this.renderView()}
      </div>
      );
    }

}
