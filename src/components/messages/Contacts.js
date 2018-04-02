import React, { Component } from "react";
import { Link } from "react-router-dom";
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
  signUserOut
} from "blockstack";
import SingleConversation from './SingleConversation';
import axios from 'axios';

const blockstack = require("blockstack");
const { getPublicKeyFromPrivate } = require('blockstack');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Contacts extends Component {
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
      results: [],
      messages: [],
      filteredContacts: [],
      contacts: [],
      showFirstLink: "",
      showSecondLink: "hide",
      redirect: false,
      newContact: "",
      addContact: "",
      confirmAdd: false,
      add: false,
      loading: "hide",
      show: "",
      newContactImg: avatarFallbackImage
    }
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
    this.handleNewContact = this.handleNewContact.bind(this);
    this.newContact = this.newContact.bind(this);
    this.filterList = this.filterList.bind(this);
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

  componentDidUpdate() {
    if(this.state.confirmAdd == true) {
      this.handleaddItem();
    }
  }

  newContact() {
    this.setState({add: true});
  }

  handleaddItem() {
    console.log("adding...");
    this.setState({ showResults: "hide", loading: "", show: "hide", confirmAdd: false })
    // let addContact = this.state.addContact
    // console.log(this.state.addContact + '.id');
    lookupProfile(this.state.addContact + '.id', "https://core.blockstack.org/v1/names")
      .then((profile) => {
        let image = profile.image;
        console.log(profile);
        if(profile.image){
          this.setState({newContactImg: image[0].contentUrl})
        } else {
          this.setState({ newContactImg: avatarFallbackImage })
        }
      }).then(() => {
        const object = {};
        object.contact = this.state.addContact + '.id';
        object.img = this.state.newContactImg;
        console.log(object);
        this.setState({ contacts: [...this.state.contacts, object], add: false });
        this.setState({ filteredContacts: [...this.state.contacts, object], add: false });
        setTimeout(this.saveNewFile, 500);
      })
      .catch((error) => {
        console.log('could not resolve profile')
      })
  }

  saveNewFile() {
    putFile("contact.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log("Saved!");
        this.setState({loading: "hide", show: "" });
      })
      .catch(e => {
        console.log(e);
      });
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  handleNewContact(e) {
    this.setState({ newContact: e.target.value })
    let link = 'https://core.blockstack.org/v1/search?query=';
    axios
      .get(
        link + this.state.newContact
      )
      .then(res => {
        this.setState({ results: res.data.results });
      })
      .catch(error => {
        console.log(error);
      });
  }

  filterList(event){
    var updatedList = this.state.contacts;
    updatedList = updatedList.filter(function(item){
      return item.contact.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    this.setState({filteredContacts: updatedList});
  }


  renderView() {
    let contacts = this.state.filteredContacts;
    console.log(loadUserData().username);
    const userData = blockstack.loadUserData();
    const person = new blockstack.Person(userData.profile);
    let show = this.state.show;
    let showResults = "";
    let loading = this.state.loading;
    let results = this.state.results;
    let newContact = this.state.newContact;
    let showFirstLink = this.state.showFirstLink;
    let showSecondLink = this.state.showSecondLink;

    if(newContact.length < 1) {
      showResults = "hide";
    } else {
      showResults = "";
    }

    if(this.state.add == true){
    return (
      <div className="add-contact">
        <h3 className="center-align">Add a new contact</h3>
        <div className="card card-add">
          <div className="add-new">
            <label>Search for a Contact</label>
            <input type="text" placeholder="Ex: Johnny Cash" onChange={this.handleNewContact} />
            <div className={showResults}>
            <ul className="collection">
            {results.map(result => {
              let profile = result.profile;
              let image = profile.image;
              let imageLink;
              if(image !=null) {
                if(image[0]){
                  imageLink = image[0].contentUrl;
                } else {
                  imageLink = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
                }
              } else {
                imageLink = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
              }

                return (
                  <div key={result.username} className={showFirstLink}>
                  <a className="contact-add" onClick={() => this.setState({ addContact: result.username, confirmAdd: true })}>
                  <li className="collection-item avatar">
                    <img src={imageLink} alt="avatar" className="circle" />
                    <span className="title">{result.profile.name}</span>
                    <p>{result.username}
                    </p>

                      <a className="secondary-content"></a>


                  </li>
                  </a>
                  </div>
                )
              })
            }
            </ul>

            </div>
            <div className={show}>
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
    );
  } else {
    return (
      <div>
        <div className="docs">
        <h3 className="center-align">Contacts</h3>
        <div className="">
          <form className="searchform">
          <fieldset className="form-group searchfield">
          <input type="text" className="form-control form-control-lg contactsform searchinput" placeholder="Search Contacts" onChange={this.filterList}/>
          </fieldset>
          </form>
        </div>

          <div className="row">
          <div className="col s12 m6 l3">
            <a onClick={this.newContact}><div className="card collections-card">
              <div className="center-align new-doc card-content">
                <p><i className="addDoc addContact medium material-icons">add</i></p>
              </div>
              <h5 className="center-align black-text">New Contact</h5>
            </div></a>
          </div>
            {contacts.slice(0).reverse().map(contact => {
                return (
                  <div key={contact.contact} className="col s12 m6 l3">
                      <div className="card collections-card hoverable horizontal">
                      <Link to={'/contacts/profile/'+ contact.contact} className="side-card contacts-side">
                        <div className="card-image card-image-side contacts-side">
                          <img src="https://i.imgur.com/st3JArl.png" alt="contacts-icon" />
                        </div>
                      </Link>
                        <div className="card-stacked">
                        <Link to={'/contacts/profile/'+ contact.contact} className="black-text">
                          <div className="card-content">

                            <p className="title contacts-title">{contact.contact.length > 14 ? contact.contact.substring(0,14)+"..." :  contact.contact}</p>
                          </div>
                        </Link>
                          <div className="edit-card-action card-action">
                            <p><span className="muted muted-card"></span><Link to={'/contacts/delete/'+ contact.contact}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></p>
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

  render(){
    console.log("Contact: " + this.state.addContact);
    const userData = blockstack.loadUserData();
    const person = new blockstack.Person(userData.profile);
    return(
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="http://www.iconsplace.com/icons/preview/white/pencil-256.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
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
        {this.renderView()}
      </div>
    )
  }
}
// <div className="center-align">
//   <img className="responsive-img circle profile-img" src={contact.img} alt="profile" />
// </div>
