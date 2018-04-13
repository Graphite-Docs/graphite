import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack';
const blockstack = require("blockstack");
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedSheets extends Component {

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

    getFile("spread.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
       } else {
         console.log("Nothing shared");
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
    object.content = this.state.grid;
    object.id = rando;
    object.created = month + "/" + day + "/" + year;

    this.setState({ sheets: [...this.state.sheets, object] });
    this.setState({ tempDocId: object.id });
    this.setState({ loading: "" });
    // this.setState({ confirm: true, cancel: false });
    setTimeout(this.saveNewFile, 500);
    // setTimeout(this.handleGo, 700);
  }

  saveNewFile() {
    putFile("spread.json", JSON.stringify(this.state), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        window.location.replace("/sheets");
      })
      .catch(e => {
        console.log("e");
        console.log(e);

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
          window.Materialize.toast('Could not find user', 2000);
          setTimeout(this.windowRefresh, 2000);
        })

      const options = { username: this.state.senderID, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

      getFile('sharedsheet.json', options)
        .then((file) => {
          const doc = JSON.parse(file || '{}');
          console.log(doc.title);
          this.setState({ title: doc.title, grid: doc.content, receiverID: doc.receiverID })
          this.setState({ show: "hide", loading: "hide", hideButton: ""});
        })
        .catch((error) => {
          console.log('could not fetch');
          this.setState({ loading: "hide" });
          window.Materialize.toast('Nothing shared', 2000);
          setTimeout(this.windowRefresh, 2000);
        })
        .then(() => {
          this.setState({ isLoading: false })
        })
    }

  windowRefresh() {
    window.location.reload(true);
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
    this.fetchData();
    this.setState({ hideButton: "hide", loading: "" });
  }

  renderView() {
    const show = this.state.show;
    console.log(loadUserData().username);
    let contacts = this.state.filteredContacts;

    if(this.state.sharedWithMe === true) {
      return(
      <div className={show}>
        <div className="container center-align">
          <h3>Sheets Shared With Me</h3>
          <h5>Select the contact who shared with you</h5>
        </div>

        <div className="shared-contacts row">
        {contacts.slice(0).reverse().map(contact => {
            return (
              <div key={contact.contact} className="col s12 m6 l3">
                  <div className="card collections-card hoverable horizontal">
                  <Link to={'/sheets/shared/'+ contact.contact} className="side-card sheets-side">
                    <div className="card-image card-image-side sheets-side">
                      <img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" />
                    </div>
                  </Link>
                    <div className="card-stacked">
                    <Link to={'/sheets/shared/'+ contact.contact} className="black-text">
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
          <h3>Sheets Shared With Others</h3>
          <h5 >Select the contact you shared with</h5>
        </div>

        <div className="shared-contacts row">
        {contacts.slice(0).reverse().map(contact => {
            return (
              <div key={contact.contact} className="col s12 m6 l3">
                  <div className="card collections-card hoverable horizontal">
                  <Link to={'/sheets/sent/'+ contact.contact} className="side-card sheets-side">
                    <div className="card-image card-image-side sheets-side">
                      <img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" />
                    </div>
                  </Link>
                    <div className="card-stacked">
                    <Link to={'/sheets/sent/'+ contact.contact} className="black-text">
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
                <li><a className="dropdown-button" href="#!" data-activates="dropdown1"><img src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" alt="avatar" /><i className="material-icons right">arrow_drop_down</i></a></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="shared-docs-page">
          <div className="share-buttons center-align">
            <button onClick={() => this.setState({ sharedWithMe: true })} className="share-button">Shared with me</button>
            <button onClick={() => this.setState({ sharedWithMe: false })} className="share-button">Shared with others</button>
          </div>
        </div>
        {this.renderView()}
      </div>
      );
    }

}
