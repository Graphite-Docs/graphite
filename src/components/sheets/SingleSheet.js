import React, { Component } from 'react';
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import HotTable from 'react-handsontable';
import update from 'immutability-helper';
import {CSVLink} from 'react-csv';
import RemoteStorage from 'remotestoragejs';
import Widget from 'remotestorage-widget';
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const { getPublicKeyFromPrivate } = require('blockstack');
const remoteStorage = new RemoteStorage({logging: false});
const widget = new Widget(remoteStorage);
const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');

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
      sharedWith: [],
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
      gaiaLink: "",
      remoteTitle: "",
      remoteContent: [
        [],
      ],
      remoteId: "",
      singleSheet: {},
      remoteUpdated: "",
      remoteStorage: false,
      hideStealthy: true,
      revealModule: "innerStealthy"
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
    this.handleBack = this.handleBack.bind(this); //this is here to resolve auto-save and home button conflicts
  }
  componentDidMount() {

    window.$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'left', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    }
  );
    let privateKey = loadUserData().appPrivateKey;
    const thisFile = this.props.match.params.id;
    const fullFile = '/sheets/' + thisFile + '.json';
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

      getFile(this.props.match.params.id + 'sharedwith.json', {decrypt: true})
       .then((fileContents) => {
         if(JSON.parse(fileContents || '{}').length > 0) {
           this.setState({ sharedWith: JSON.parse(fileContents || '{}') })
         } else {
           this.setState({ sharedWith: [] });
         }
       })
        .catch(error => {
          console.log("shared with doc error: ")
          console.log(error);
        });

    getFile("sheetscollection.json", {decrypt: true})
     .then((fileContents) => {
        this.setState({ sheets: JSON.parse(fileContents || '{}').sheets })
        console.log("loaded");
        this.setState({ initialLoad: "hide" });
     }).then(() =>{
       let sheets = this.state.sheets;
       const thisSheet = sheets.find((sheet) => { return sheet.id.toString() === this.props.match.params.id}); //this is comparing strings
       let index = thisSheet && thisSheet.id;
       console.log(index);
       function findObjectIndex(sheet) {
           return sheet.id === index; //this is comparing numbers
       }
       // let grid = thisSheet && thisSheet.content;
       this.setState({ sharedWith: thisSheet && thisSheet.sharedWith, index: sheets.findIndex(findObjectIndex) })
       // console.log(this.state.title);
     })
      .catch(error => {
        console.log(error);
      });

    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       console.log("loading file: ");
       console.log(JSON.parse(fileContents || '{}'));
       if(fileContents) {
         this.setState({ title: JSON.parse(fileContents || '{}').title, grid: JSON.parse(fileContents || '{}').content  })
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
      setTimeout(this.handleAddItem,1000);

      remoteStorage.access.claim(thisFile, 'rw');
      remoteStorage.caching.enable('/' + thisFile + '/');
      const client = remoteStorage.scope('/' + thisFile + '/');
      widget.attach('remote-storage-element-id');
      remoteStorage.on('connected', () => {
        const userAddress = remoteStorage.remote.userAddress;
        console.debug(`${userAddress} connected their remote storage.`);
      })

    remoteStorage.on('network-offline', () => {
      console.debug(`We're offline now.`);
    })

    remoteStorage.on('network-online', () => {
      console.debug(`Hooray, we're back online.`);
    })
    client.getFile('title.txt').then(file => {
      if(file.data !== null) {
          this.setState({ remoteTitle: file.data });
      }

    });
    client.getFile('content.txt').then(file => {
      if(file.data !==null) {
        this.setState({ remoteContent: decryptECIES(privateKey, JSON.parse(file.data)) });
      }

    });
    client.getFile('id.txt').then(file => {
      if(file.data !==null) {
        this.setState({ remoteId: decryptECIES(privateKey, JSON.parse(file.data)) });
      }

    });
    client.getFile('updated.txt').then(file => {
      if(file.data !==null) {
        this.setState({ remoteUpdated: decryptECIES(privateKey, JSON.parse(file.data)) });
      }

    });
  }

  componentDidUpdate() {
    if(this.state.confirmAdd === true) {
      this.sharedInfo();
    }
  }

    handleAddItem() {
      const object = {};
      object.title = this.state.title;
      object.content = this.state.grid;
      object.id = parseInt(this.props.match.params.id, 10);
      object.updated = getMonthDayYear();
      object.sharedWith = this.state.sharedWith;
      object.fileType = "sheets";
      const objectTwo = {};
      objectTwo.title = object.title;
      objectTwo.id = object.id;
      objectTwo.updated = object.updated;
      objectTwo.sharedWith = object.sharedWith;
      objectTwo.fileType = "sheets";
      const index = this.state.index;
      const updatedSheet = update(this.state.sheets, {$splice: [[index, 1, objectTwo]]});  // array.splice(start, deleteCount, item1)
      this.setState({sheets: updatedSheet, singleSheet: object });
      this.setState({autoSave: "Saving..."});
      this.autoSave();
    }

    handleBack() {
      if(this.state.autoSave === "Saving") {
        setTimeout(this.handleBack, 500);
      } else {
        window.location.replace("/sheets");
      }
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
  const file = this.props.match.params.id;
  const fullFile = '/sheets/' + file + '.json';
  putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt: true})
    .then(() => {
      console.log("Autosaved");
      this.saveCollection();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });

    remoteStorage.access.claim(this.props.match.params.id, 'rw');
    remoteStorage.caching.enable('/' + this.props.match.params.id + '/');
    const client = remoteStorage.scope('/' + this.props.match.params.id + '/');
    const content = this.state.grid;
    const title = this.state.title;
    const updated = getMonthDayYear();
    const id = this.props.match.params.id;
    const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    if(this.state.grid !== []) {
      client.storeFile('text/plain', 'content.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(content))))
      .then(() => { console.log("Grid saving done") });
    }
    client.storeFile('text/plain', 'title.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(title))))
    .then(() => { console.log("Title saved") });
    client.storeFile('text/plain', 'updated.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(updated))))
    .then(() => { console.log("Updated date saved") });
    client.storeFile('text/plain', 'id.txt', JSON.stringify(encryptECIES(publicKey, JSON.stringify(id))))
    .then(() => { console.log("ID saved") });
}

saveCollection() {
  putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt: true})
    .then(() => {
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
    const object = {};
    object.title = this.state.title;
    object.content = this.state.grid;
    object.shared = getMonthDayYear();
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
  // const userShort = user.slice(0, -3);
  // const fileName = 'sharedsheets.json'
  // const file = userShort + fileName;
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
  // const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}

  getFile(file, {decrypt: true})
   .then((fileContents) => {
      this.setState({ shareFile: JSON.parse(fileContents || '{}') })
      this.setState({ loading: "", show: "hide" });
      const object = {};
      object.title = this.state.title;
      object.content = this.state.grid;
      object.id = Date.now();
      object.receiverID = this.state.receiverID;
      object.shared = getMonthDayYear();
      this.setState({ shareFile: [...this.state.shareFile, object], sharedWith: [...this.state.sharedWith, this.state.receiverID] });
      setTimeout(this.shareSheet, 700);
   })
    .catch(error => {
      console.log(error);
      // this.setState({ loading: "", show: "hide" });
      // const object = {};
      // object.title = this.state.title;
      // object.content = this.state.grid;
      // object.id = Date.now();
      // object.receiverID = this.state.receiverID;
      // object.shared = getMonthDayYear();
      // this.setState({ shareFile: [...this.state.shareFile, object], sharedWith: [...this.state.sharedWith, this.state.receiverID] });
      // setTimeout(this.shareSheet, 700);
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

      putFile(this.props.match.params.id + 'sharedwith.json', JSON.stringify(this.state.sharedWith), {encrypt: true})
        .then(() => {
          console.log("Shared With File Updated")
          this.handleAddItem();
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
  const { revealModule, hideStealthy, loading, autoSave, shareModal, show, hideSheet, initialLoad, contacts, publicShare, remoteStorage } = this.state;
  const remoteStorageActivator = remoteStorage === true ? "" : "hide";
  const {length} = contacts
  const stealthy = (hideStealthy) ? "hide" : ""
  let users = '&length=' + length
  let k = 0
  for (const i of contacts) {
    users += '&id' + k + "=" + i.contact
    k += 1
  }
  // const to = (sharedWith && sharedWith[sharedWith.length - 1] && sharedWith[sharedWith.length - 1].contact) ? sharedWith[sharedWith.length - 1].contact : ''
  const stealthyUrlStub = (process.env.NODE_ENV !== 'production') ?
    'http://localhost:3030/?app=gd04012018' :
    'https://www.stealthy.im/?app=gd04012018';
  const stealthyUrl = stealthyUrlStub + users;

  // const stealthyModule = (length > 0) ? (
  const stealthyModule =  (<div className={stealthy}>
      <div id='stealthyCol' className='card'>
      <div className={revealModule}>
        <iframe title="Stealthy" src={stealthyUrl} id='stealthyFrame' />
      </div>
    </div>
    </div>
  )

  if(this.state.initialLoad === "") {
    return (
      <div className="center-align sheets-loader">
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a onClick={this.handleBack} className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>

              <ul className="left toolbar-menu">
              <li><input className="white-text small-menu" type="text" placeholder="Sheet Title" value={this.state.title} onChange={this.handleTitleChange} /></li>
              <li><a className="small-menu muted">{autoSave}</a></li>
              </ul>
              <ul className="right toolbar-menu small-toolbar-menu auto-save">
              <li><a className="tooltipped dropdown-button" data-activates="dropdown2" data-position="bottom" data-delay="50" data-tooltip="Share"><i className="small-menu material-icons">people</i></a></li>
              <li><a className="dropdown-button" data-activates="dropdown1"><i className="small-menu material-icons">more_vert</i></a></li>
              <li><a className="small-menu tooltipped stealthy-logo" data-position="bottom" data-delay="50" data-tooltip="Stealthy Chat" onClick={() => this.setState({hideStealthy: !hideStealthy})}><img className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/></a></li>
              </ul>

              {/*Share Menu Dropdown*/}
              <ul id="dropdown2"className="dropdown-content collection cointainer">
              <li><span className="center-align">Select a contact to share with</span></li>
              <a href="/contacts"><li><span className="muted blue-text center-align">Or add new contact</span></li></a>
              <li className="divider" />
              {contacts.slice(0).reverse().map(contact => {
                  return (
                    <li key={contact.contact}className="collection-item">
                      <a onClick={() => this.setState({ receiverID: contact.contact, confirmAdd: true })}>
                      <p>{contact.contact}</p>
                      </a>
                    </li>
                  )
                })
              }
              </ul>
              {/*Share Menu Dropdown*/}

              {/* Dropdown menu content */}
              <ul id="dropdown1" className="dropdown-content single-doc-dropdown-content">
                <li><a onClick={() => this.setState({ remoteStorage: !remoteStorage })}>Remote Storage</a></li>
                <li className="divider"></li>
                <li><a onClick={this.print}>Print</a></li>
                <li><CSVLink data={this.state.grid} filename={this.state.title + '.csv'} >Download</CSVLink></li>
                {this.state.journalismUser === true ? <li><a onClick={() => this.setState({send: true})}>Submit Article</a></li> : <li className="hide"/>}
                <li className="divider"></li>
                <li><a data-activates="slide-out" className="menu-button-collapse button-collapse">Comments</a></li>
                {this.state.enterpriseUser === true ? <li><a href="#!">Tag</a></li> : <li className="hide"/>}
                {this.state.enterpriseUser === true ? <li><a href="#!">History</a></li> : <li className="hide"/>}
              </ul>
            {/* End dropdown menu content */}
            {/*Remote storae widget*/}
              <div className={remoteStorageActivator} id="remotestorage">
                <div id='remote-storage-element-id'></div>
              </div>
              {/*Remote storae widget*/}

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
            <a onClick={this.handleBack} className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>

              <ul className="left toolbar-menu">
              <li><input className="white-text small-menu" type="text" placeholder="Sheet Title" value={this.state.title} onChange={this.handleTitleChange} /></li>
              <li><a className="small-menu muted">{autoSave}</a></li>
              </ul>
              <ul className="right toolbar-menu small-toolbar-menu auto-save">

              <li><a className="tooltipped dropdown-button" data-activates="dropdown2" data-position="bottom" data-delay="50" data-tooltip="Share"><i className="small-menu material-icons">people</i></a></li>
              <li><a className="dropdown-button" data-activates="dropdown1"><i className="small-menu material-icons">more_vert</i></a></li>
              <li><a className="small-menu tooltipped stealthy-logo" data-position="bottom" data-delay="50" data-tooltip="Stealthy Chat" onClick={() => this.setState({hideStealthy: !hideStealthy})}><img className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/></a></li>
              </ul>

              {/*Share Menu Dropdown*/}
              <ul id="dropdown2"className="dropdown-content collection cointainer">
              <li><span className="center-align">Select a contact to share with</span></li>
              <a href="/contacts"><li><span className="muted blue-text center-align">Or add new contact</span></li></a>
              <li className="divider" />
              {contacts.slice(0).reverse().map(contact => {
                  return (
                    <li key={contact.contact}className="collection-item">
                      <a onClick={() => this.setState({ receiverID: contact.contact, confirmAdd: true })}>
                      <p>{contact.contact}</p>
                      </a>
                    </li>
                  )
                })
              }
              </ul>
              {/*Share Menu Dropdown*/}

              {/* Dropdown menu content */}
              <ul id="dropdown1" className="dropdown-content single-doc-dropdown-content">
                <li><a onClick={() => this.setState({ remoteStorage: !remoteStorage })}>Remote Storage</a></li>
                <li className="divider"></li>
                <li><a onClick={this.print}>Print</a></li>
                <li><CSVLink data={this.state.grid} filename={this.state.title + '.csv'} >Download</CSVLink></li>
                {this.state.journalismUser === true ? <li><a onClick={() => this.setState({send: true})}>Submit Article</a></li> : <li className="hide"/>}
                <li className="divider"></li>
                <li><a data-activates="slide-out" className="menu-button-collapse button-collapse">Comments</a></li>
                {this.state.enterpriseUser === true ? <li><a href="#!">Tag</a></li> : <li className="hide"/>}
                {this.state.enterpriseUser === true ? <li><a href="#!">History</a></li> : <li className="hide"/>}
              </ul>
            {/* End dropdown menu content */}
            {/*Remote storae widget*/}
              <div className={remoteStorageActivator} id="remotestorage">
                <div id='remote-storage-element-id'></div>
              </div>
              {/*Remote storae widget*/}

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
                <p>Ask the person you are sharing with to visit <a href="https://app.graphitedocs.com/publicdoc" target="_blank" rel="noopener noreferrer">https://app.graphitedocs.com/publicdoc</a> and provide this link to them: </p>
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
          <div id='spreadsheet' />
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
                autoRowSize: true,
                manualColumnMove: true,
                manualRowMove: true,
                ref: "hot",
                fixedRowsTop: 0,
                minSpareRows: 1,
                comments: true,
                licenseKey: '6061a-b3be5-94c65-64d27-a1d41',
                onAfterChange: (changes, source) => {if(changes){
                  clearTimeout(this.timeout);
                  this.timeout = setTimeout(this.handleAddItem, 1000)
                }}
              }}
               />
            </div>
          </div>
          {stealthyModule}
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
