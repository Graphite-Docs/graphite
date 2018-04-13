import React, { Component } from 'react';
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import HotTable from 'react-handsontable';
import update from 'immutability-helper';
import {CSVLink} from 'react-csv';
const { encryptECIES } = require('blockstack/lib/encryption');

export default class SingleSheet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      contacts: [],
      sheets: [],
      grid: [
        [],
      ],
      checkGrid: [
        [],
      ],
      title: "",
      shareFile: [],
      index: "",
      save: "",
      saveNow: false,
      loading: "hide",
      printPreview: false,
      confirmAdd: false,
      autoSave: "Saved",
      receiverID: "",
      shareModal: "hide",
      hideSheet: "",
      initialLoad: "",
      show: "",
      pubKey: "",
      singlePublic: {},
      publicShare: "hide",
      gaiaLink: ""
    }
    this.autoSave = this.autoSave.bind(this);
    this.shareModal = this.shareModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.shareSheet = this.shareSheet.bind(this);
    this.sharedInfo = this.sharedInfo.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.sharePublicly = this.sharePublicly.bind(this);
    this.stopSharing = this.stopSharing.bind(this);
    this.saveStop = this.saveStop.bind(this);
    this.savePublic = this.savePublic.bind(this);
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
       let grid = thisSheet && thisSheet.content;
       this.setState({ grid: grid || this.state.grid, title: thisSheet && thisSheet.title, index: sheets.findIndex(findObjectIndex) })
       console.log(this.state.grid);
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
      console.clear();
      setTimeout(this.handleAddItem,1000);
    }

  componentDidUpdate() {
    if(this.state.confirmAdd === true) {
      this.sharedInfo();
    }
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
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.handleAddItem, 1000);
    // setTimeout(this.handleAddItem, 1500);
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
    shareModal: "",
    hideSheet: "hide"
  });
}

sharePublicly() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.grid;
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
  // gaiaLink = apps["https://app.graphitedocs.com"];
  gaiaLink = apps["http://localhost:3000"];

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
  window.Materialize.toast("Link copied to clipboard", 1000);
}

sharedInfo(){
  this.setState({ confirmAdd: false});
  const user = this.state.receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'sharedsheets.json'
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
        window.Materialize.toast(this.state.receiverID + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
        this.setState({ shareModal: "hide", loading: "hide", show: "", hideSheet: "" });
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
   })
    .catch(error => {
      console.log(error);
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
    shareModal: "hide",
    hideSheet: ""
  });
}

shareSheet() {
  const user = this.state.receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'sharedsheets.json'
  const file = userShort + fileName;
  putFile(file, JSON.stringify(this.state.shareFile), {encrypt: true})
    .then(() => {
      this.setState({ shareModal: "hide", loading: "hide", show: "", hideSheet: "" });
      window.Materialize.toast('Sheet shared with ' + this.state.receiverID, 4000);
    })
    .catch(e => {
      console.log(e);
    });
    const publicKey = this.state.pubKey;
    const data = this.state.shareFile;
    const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
    const directory = '/shared/' + file;
    putFile(directory, encryptedData, {encrypt: false})
      .then(() => {
        console.log("Shared encrypted file");
      })
      .catch(e => {
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
  // console.clear();
  const loading = this.state.loading;
  const save = this.state.save;
  const autoSave = this.state.autoSave;
  const shareModal = this.state.shareModal;
  const show = this.state.show;
  const hideSheet = this.state.hideSheet;
  const initialLoad = this.state.initialLoad;
  const contacts = this.state.contacts;
  const publicShare = this.state.publicShare;

  if(this.state.initialLoad === "") {
    return (
      <div className="center-align sheets-loader">
      <div className="navbar toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/sheets" className="brand-logo left"><i className="small-brand material-icons">arrow_back</i></a>


              <ul className="left toolbar-menu">
                <li><input className="white-text small-menu" type="text" placeholder="Sheet Title" value={this.state.title} onChange={this.handleTitleChange} /></li>
                <li><a onClick={this.print}><i className="material-icons">local_printshop</i></a></li>
                <li><CSVLink data={this.state.grid} filename={this.state.title + '.csv'} ><img className="csvlogo" src="http://www.iconsplace.com/download/white-csv-512.png" /></CSVLink></li>
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
      <div className="navbar toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/sheets" className="brand-logo left"><i className="small-brand material-icons">arrow_back</i></a>


              <ul className="left toolbar-menu">
                <li><input className="white-text" type="text" placeholder="Sheet Title" value={this.state.title} onChange={this.handleTitleChange} /></li>
                <li><a onClick={this.print}><i className="material-icons">local_printshop</i></a></li>
                <li><CSVLink data={this.state.grid} filename={this.state.title + '.csv'}><img className="csvlogo" src="http://www.iconsplace.com/download/white-csv-512.png" /></CSVLink></li>
                <li><a onClick={this.shareModal}><i className="material-icons">share</i></a></li>
              </ul>
              <ul className="right toolbar-menu auto-save">
              <li className="muted">{autoSave}</li>
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
          <p>Select the person to share with.</p>
          <div className={show}>
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
        <div>
          <div className={hideSheet}>
            <div className="spreadsheet-table">
              <HotTable root="hot" settings={{
                data: this.state.grid,
                stretchH: 'all',
                manualRowResize: true,
                manualColumnResize: true,
                colHeaders: true,
                rowHeaders: true,
                colWidths: 100,
                rowHeights: 30,
                minCols: 26,
                minRows: 100,
                contextMenu: true,
                formulas: true,
                columnSorting: true,
                contextMenu: true,
                autoRowSize: true,
                manualColumnMove: true,
                manualRowMove: true,
                ref: "hot",
                fixedRowsTop: 0,
                minSpareRows: 1,
                comments: true,
                onAfterChange: (changes, source) => {if(changes){
                  clearTimeout(this.timeout);
                  this.timeout = setTimeout(this.handleAddItem, 1000)
                }}
              }}
               />

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
