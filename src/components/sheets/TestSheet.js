import React, { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack';
import update from 'immutability-helper';
const formula = require('excel-formula');
const blockstack = require("blockstack");
const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');

export default class TestSheet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      contacts: [],
      sheets: [],
      grid: [
        [],
      ],
      title: "",
      shareFile: [],
      index: "",
      save: "",
      loading: "hide",
      printPreview: false,
      autoSave: "Saved",
      receiverID: "",
      shareModal: "hide",
      shareFile: "",
      initialLoad: "",
      show: "",
      pubKey: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.autoSave = this.autoSave.bind(this);
    this.shareModal = this.shareModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.shareSheet = this.shareSheet.bind(this);
    this.sharedInfo = this.sharedInfo.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
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


    getFile("spread.json", {decrypt: true})
     .then((fileContents) => {
        this.setState({ sheets: JSON.parse(fileContents || '{}').sheets })
        console.log("loaded");
        this.setState({ initialLoad: "hide" });
     }).then(() =>{
       let sheets = this.state.sheets;
       const thisSheet = sheets.find((sheet) => { return sheet.id == this.props.match.params.id});
       // console.log(thisSheet);
       let index = thisSheet && thisSheet.id;
       console.log(index);
       function findObjectIndex(sheet) {
           return sheet.id == index;
       }
       this.setState({ grid: thisSheet && thisSheet.content || this.state.grid, title: thisSheet && thisSheet.title, index: sheets.findIndex(findObjectIndex) })
       console.log(this.state.grid);
     })
     .then(() => {
       this.$el = $(this.el);
       this.$el.jexcel({
         data: this.state.grid,
         onchange: this.handleChange,
         minDimensions:[40,100],
         colWidths: [ ]
       });
       this.$el.jexcel('updateSettings', {
         cells: function (cell, col, row) {
             if (col > 0) {
                 value = $('#my').jexcel('getValue', $(cell));
                 val = numeral($(cell).text()).format('0,0.00');
                 $(cell).html('' + val);
             }
         }
       });
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
      this.download = () => {
        this.$el.jexcel('download');
      }
      setTimeout(this.handleAddItem,1000);
      this.refresh = setInterval(() => this.handleAddItem(), 3000);
    }

    componentWillUnmount() {
      // this.$el.jexcel({ data: data, colWidths: [ 300, 80, 100 ] })('destroy');
    }
    handleAddItem() {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const object = {};
      object.title = this.state.title;
      object.content = this.state.grid;
      object.id = parseInt(this.props.match.params.id);
      object.updated = month + "/" + day + "/" + year;
      const index = this.state.index;
      const updatedSheet = update(this.state.sheets, {$splice: [[index, 1, object]]});  // array.splice(start, deleteCount, item1)
      this.setState({sheets: updatedSheet});
      this.autoSave();
    }

    handleTitleChange(e) {
      this.setState({
        title: e.target.value
      });
    }

handleChange(instance, cell, value) {
    var cellName = $(instance).jexcel('getColumnNameFromId', $(cell).prop('id'));
    console.log('New change on cell ' + cellName + ' to: ' + value + '<br>');
    console.log(this.state.grid);
}

handleIDChange(e) {
    this.setState({ receiverID: e.target.value })
  }

autoSave() {
  this.setState({autoSave: "Saving..."});
  putFile("spread.json", JSON.stringify(this.state), {encrypt: true})
    .then(() => {
      console.log("Autosaved");
      this.setState({autoSave: "Saved"});
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    
    });
}

shareModal() {
  this.setState({
    shareModal: ""
  });
}

sharedInfo(){
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
        console.log(error);
        Materialize.toast(this.state.receiverID + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
        this.setState({ shareModal: "hide", loading: "hide", show: "" });
      });
}

loadMyFile() {
  const user = this.state.receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'sharedsheets.json'
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
      object.content = this.state.grid;
      object.id = Date.now();
      object.receiverID = this.state.receiverID;
      object.shared = month + "/" + day + "/" + year;
      this.setState({ shareFile: [...this.state.shareFile, object] });
      console.log("Read this!: " + this.state.shareFile);
      setTimeout(this.shareSheet, 700);
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
      object.content = this.state.grid;
      object.id = Date.now();
      object.receiverID = this.state.receiverID;
      object.shared = month + "/" + day + "/" + year;
      this.setState({ shareFile: [...this.state.shareFile, object] });
      setTimeout(this.shareSheet, 700);
    });
}

hideModal() {
  this.setState({
    shareModal: "hide"
  });
}

shareSheet() {
  const user = this.state.receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'sharedsheets.json'
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
    const data = this.state;
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

print(){
  const curURL = window.location.href;
  history.replaceState(history.state, '', '/');
  window.print();
  history.replaceState(history.state, '', curURL);
}



renderView() {

  const loading = this.state.loading;
  const save = this.state.save;
  const autoSave = this.state.autoSave;
  const shareModal = this.state.shareModal;
  const show = this.state.show;
  const initialLoad = this.state.initialLoad;
  const contacts = this.state.contacts;
  console.log(this.state.sheets);

  if(this.state.initialLoad === "") {
    return (
      <div className="center-align sheets-loader">
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/sheets" className="brand-logo"><i className="material-icons">arrow_back</i></a>


              <ul className="left toolbar-menu">
                <li><input className="black-text" type="text" placeholder="Sheet Title" value={this.state.title} onChange={this.handleTitleChange} /></li>
                <li><a onClick={this.print}><i className="material-icons">local_printshop</i></a></li>
                <li><a ref={el => this.el = el} onClick={this.download}><img className="csvlogo" src="https://d30y9cdsu7xlg0.cloudfront.net/png/605579-200.png" /></a></li>
                <li><a onClick={this.shareModal}><i className="material-icons">share</i></a></li>
              </ul>
              <ul className="right toolbar-menu auto-save">
              <li><a className="muted">{autoSave}</a></li>
              </ul>

          </div>
        </nav>
      </div>
      <div className={initialLoad}>
        <div className="preloader-wrapper big active">
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
    );
  } else {
    return (
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/sheets" className="brand-logo"><i className="material-icons">arrow_back</i></a>


              <ul className="left toolbar-menu">
                <li><input className="black-text" type="text" placeholder="Sheet Title" value={this.state.title} onChange={this.handleTitleChange} /></li>
                <li><a onClick={this.print}><i className="material-icons">local_printshop</i></a></li>
                <li><a ref={el => this.el = el} onClick={this.download}><img className="csvlogo" src="https://d30y9cdsu7xlg0.cloudfront.net/png/605579-200.png" /></a></li>
                <li><a onClick={this.shareModal}><i className="material-icons">share</i></a></li>
              </ul>
              <ul className="right toolbar-menu auto-save">
              <li><a className="muted">{autoSave}</a></li>
              </ul>

          </div>
        </nav>
      </div>
      <div className={shareModal}>

        <div id="modal1" className="modal bottom-sheet">
          <div className="modal-content">
            <h4>Share</h4>
            <p>Enter the Blockstack user ID of the person to share with.</p>
            <p>Or select from your contacts.</p>
            <input className="share-input white grey-text" placeholder="Ex: JohnnyCash.id" type="text" value ={this.state.receiverID} onChange={this.handleIDChange} />
            <div className={show}>
              <button onClick={this.sharedInfo} className="btn black white-text">Share</button>
              <button onClick={this.hideModal} className="btn grey">Cancel</button>
            </div>
            <div className={show}>
              <div className="container">
                <h4 className="contacts-share center-align">Your Contacts</h4>
                <ul className="collection">
                {contacts.slice(0).reverse().map(contact => {
                    return (
                      <li key={contact.contact}className="collection-item avatar">
                        <img src={contact.img} alt="avatar" className="circle" />
                        <span className="title black-text">{contact.contact}</span>
                        <div>
                          <a onClick={() => this.setState({ receiverID: contact.contact })} className="secondary-content"><i className="blue-text text-darken-2 material-icons">add</i></a>
                        </div>

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
        <div>
          <div>
            <div>
              <div ref={el => this.el = el} id="mytable">
              </div>
            </div>
          </div>
        </div>
        </div>

    );
  }
}

  render () {

    return (
      <div>
      {this.renderView()}
      </div>
    )
  }
}
