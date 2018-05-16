import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
import update from 'immutability-helper';
import RemoteStorage from 'remotestoragejs';
import Widget from 'remotestorage-widget';
const remoteStorage = new RemoteStorage({logging: false});
const widget = new Widget(remoteStorage);
const { getPublicKeyFromPrivate } = require('blockstack');
const { encryptECIES } = require('blockstack/lib/encryption');
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
      contacts: [],
      shareFile: [],
      singleDoc: {},
      filteredValue: [],
      sharedWith: [],
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
      migrateWords: "",
      currentPage: 1,
      docsPerPage: 10,
      docsSelected: [],
      activeIndicator: false,
      shareModal: "hide",
      tagModal: "hide",
      receiverID: "",
      confirmAdd: false,
      pubKey: "",
      title: "",
      content: "",
      id: "",
      words: "",
      updated: "",
      tags: "",
      index: "",
      contactDisplay: "",
      loadingTwo: "hide",
      singleDocTags: [],
      tag: "",
      selectedTagId: "",
      index: "",
      deleteState: false,
      sharedCollection: [],
      sharedWithSingle: [],
      collaboratorsModal: "hide",
      tagDownload: false,
      tagList: "hide",
      dateList: "hide",
      selectedDate: "",
      selectedCollab: "",
      selectedTag: "",
      applyFilter: false,
      appliedFilter: false,
      tagIndex: ""
    }
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
    this.saveNewSingleDoc = this.saveNewSingleDoc.bind(this);
    this.filterList = this.filterList.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.download = this.download.bind(this);
    this.sharedInfo = this.sharedInfo.bind(this);
    this.share = this.share.bind(this);
    this.loadSingle = this.loadSingle.bind(this);
    this.saveCollection = this.saveCollection.bind(this);
    this.loadCollection = this.loadCollection.bind(this);
    this.setTags = this.setTags.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.deleteTag = this.deleteTag.bind(this);
    this.saveNewTags = this.saveNewTags.bind(this);
    this.loadSingleTags = this.loadSingleTags.bind(this);
    this.saveFullCollectionTags = this.saveFullCollectionTags.bind(this);
    this.addTagManual = this.addTagManual.bind(this);
    this.getCollection = this.getCollection.bind(this);
    this.loadSharedCollection = this.loadSharedCollection.bind(this);
    this.saveSingleFile = this.saveSingleFile.bind(this);
    this.saveSharedFile = this.saveSharedFile.bind(this);
    this.sendFile = this.sendFile.bind(this);
    this.getCollectionTags = this.getCollectionTags.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.filterNow = this.filterNow.bind(this);
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidUpdate() {

  }

  componentDidMount() {
    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'left', // Choose the horizontal origin
      closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    }
  );

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
         let file = JSON.parse(fileContents || '{}');
         let contacts = file.contacts;
         if(contacts.length > 0) {
           this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
         } else {
           this.setState({ contacts: [] });
         }
       })
        .catch(error => {
          console.log(error);
        });

    this.loadCollection();
  }

  setTags(e) {
    this.setState({ tag: e.target.value});
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      const object = {};
      this.setState({ singleDocTags: [...this.state.singleDocTags, this.state.tag]});
      this.setState({ tag: "" });
    }
  }

  addTagManual() {
    this.setState({ singleDocTags: [...this.state.singleDocTags, this.state.tag]});
    this.setState({ tag: "" });
  }


  loadCollection() {
    getFile("documentscollection.json", {decrypt: true})
     .then((fileContents) => {
       if(JSON.parse(fileContents || '{}').value) {
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
    object.tags = [];
    object.sharedWith = [];
    const objectTwo = {}
    objectTwo.title = object.title;
    objectTwo.id = object.id;
    objectTwo.created = object.created;
    objectTwo.content = "";
    objectTwo.tags = [];
    objectTwo.sharedWith = [];

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

  handlePageChange(event) {
    this.setState({
      currentPage: Number(event.target.id)
    });
  }

  handleCheckbox(event) {
    let checkedArray = this.state.docsSelected;
      let selectedValue = event.target.value;

        if (event.target.checked === true) {
        	checkedArray.push(selectedValue);
            this.setState({
              docsSelected: checkedArray
            });
          if(checkedArray.length === 1) {
            this.setState({activeIndicator: true});

          } else {
            this.setState({activeIndicator: false});
          }
        } else {
          this.setState({activeIndicator: false});
        	let valueIndex = checkedArray.indexOf(selectedValue);
			      checkedArray.splice(valueIndex, 1);

            this.setState({
              docsSelected: checkedArray
            });
            if(checkedArray.length === 1) {
              this.setState({activeIndicator: true});
            } else {
              this.setState({activeIndicator: false});
            }
        }
  }

  download() {
    if(this.state.docsSelected.length < 2) {
      //download single file

    } else {
      //do some looping and download multiple files
    }
  }

  sharedInfo() {
    this.setState({ confirmAdd: false });
    const user = this.state.receiverID;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

    getFile('key.json', options)
      .then((file) => {
        this.setState({ pubKey: JSON.parse(file)})
      })
        .then(() => {
          this.loadSharedCollection();
        })
        .catch(error => {
          console.log("No key: " + error);
          window.Materialize.toast(this.state.receiverID + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
          this.setState({ shareModal: "hide", loadingTwo: "hide", contactDisplay: ""});
        });
  }

loadSharedCollection () {
  const user = this.state.receiverID;
  const file = "shared.json";
  getFile(user + file, {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        this.setState({ sharedCollection: JSON.parse(fileContents || '{}') })
      } else {
        this.setState({ sharedCollection: [] });
      }
    })
    .then(() => {
      this.loadSingle();
    })
    .catch((error) => {
      console.log(error)
    });
}

loadSingle() {

  if(this.state.docsSelected.length > 1) {
    //TODO figure out how to handle this
  } else {
    const thisFile = this.state.docsSelected[0];
    const fullFile = '/documents/' + thisFile + '.json';
    const fullFileSharedWith = thisFile + 'sharedwith.json';

    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       if(JSON.parse(fileContents || '{}').sharedWith) {
         this.setState({
           title: JSON.parse(fileContents || '{}').title,
           content: JSON.parse(fileContents || '{}').content,
           tags: JSON.parse(fileContents || '{}').tags,
           updated: JSON.parse(fileContents || '{}').updated,
           words: JSON.parse(fileContents || '{}').words,
           id: JSON.parse(fileContents || '{}').id,
           sharedWithSingle: JSON.parse(fileContents || '{}').sharedWith
        });
      } else {
        this.setState({
          title: JSON.parse(fileContents || '{}').title,
          content: JSON.parse(fileContents || '{}').content,
          tags: JSON.parse(fileContents || '{}').tags,
          updated: JSON.parse(fileContents || '{}').updated,
          words: JSON.parse(fileContents || '{}').words,
          id: JSON.parse(fileContents || '{}').id,
          sharedWithSingle: []
       });
      }

     })
      .then(() => {
        this.setState({ sharedWithSingle: [...this.state.sharedWithSingle, this.state.receiverID] });
        setTimeout(this.getCollection, 300);
      })
      .catch(error => {
        console.log(error);
      });
    }
}

getCollection() {
  getFile("documentscollection.json", {decrypt: true})
  .then((fileContents) => {
     this.setState({ value: JSON.parse(fileContents || '{}').value })
     this.setState({ initialLoad: "hide" });
  }).then(() =>{
    let value = this.state.value;
    const thisDoc = value.find((doc) => { return doc.id == this.state.docsSelected[0]});
    let index = thisDoc && thisDoc.id;
    function findObjectIndex(doc) {
        return doc.id == index;
    }
    this.setState({index: value.findIndex(findObjectIndex) });
  })
    .then(() => {
      this.share();
    })
    .catch(error => {
      console.log(error);
    });
}

  share() {
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.id = this.state.id;
    object.updated = this.state.updated;
    object.sharedWith = this.state.sharedWithSingle;
    object.tags = this.state.tags;
    const index = this.state.index;
    const updatedDocs = update(this.state.value, {$splice: [[index, 1, object]]});  // array.splice(start, deleteCount, item1)
    this.setState({value: updatedDocs, singleDoc: object, sharedCollection: [...this.state.sharedCollection, object]});

    setTimeout(this.saveSharedFile, 300);
  }

  saveSharedFile() {
    const user = this.state.receiverID;
    const file = "shared.json";

    putFile(user + file, JSON.stringify(this.state.sharedCollection), {encrypt: true})
      .then(() => {
        console.log("Shared Collection Saved");
        this.saveSingleFile();
      })
  }

  saveSingleFile() {
    const file = this.state.docsSelected[0];
    const fullFile = '/documents/' + file + '.json'
    putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        this.saveCollection();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveCollection() {
    putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log("Saved Collection");
        this.sendFile();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  sendFile() {
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const fileName = 'shareddocs.json'
    const file = userShort + fileName;
    const publicKey = this.state.pubKey;
    const data = this.state.sharedCollection;
    const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
    const directory = '/shared/' + file;
    putFile(directory, encryptedData, {encrypt: false})
      .then(() => {
        console.log("Shared encrypted file ");
        window.Materialize.toast('Document shared with ' + this.state.receiverID, 4000);
        this.loadCollection();
        this.setState({shareModal: "hide", loadingTwo: "hide", contactDisplay: ""});
      })
      .catch(e => {
        console.log(e);
      });
  }

  loadSingleTags() {

    this.setState({tagDownload: false});
    const thisFile = this.state.docsSelected[0];
    const fullFile = '/documents/' + thisFile + '.json';

    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       if(JSON.parse(fileContents || '{}').tags) {
         this.setState({
           shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
           title: JSON.parse(fileContents || '{}').title,
           id: JSON.parse(fileContents || '{}').id,
           updated: JSON.parse(fileContents || '{}').updated,
           sharedWith: JSON.parse(fileContents || '{}').sharedWith,
           singleDocTags: JSON.parse(fileContents || '{}').tags,
           content: JSON.parse(fileContents || '{}').content
        });
      } else {
        this.setState({
          shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
          title: JSON.parse(fileContents || '{}').title,
          id: JSON.parse(fileContents || '{}').id,
          updated: JSON.parse(fileContents || '{}').updated,
          sharedWith: JSON.parse(fileContents || '{}').sharedWith,
          singleDocTags: [],
          content: JSON.parse(fileContents || '{}').content
       });
      }
     })
     .then(() => {
       this.setState({ tagModal: ""});
       setTimeout(this.getCollectionTags, 300);
     })
      .catch(error => {
        console.log(error);
      });
  }

  getCollectionTags() {
    getFile("documentscollection.json", {decrypt: true})
    .then((fileContents) => {
       this.setState({ value: JSON.parse(fileContents || '{}').value })
       this.setState({ initialLoad: "hide" });
    }).then(() =>{
      let value = this.state.value;
      const thisDoc = value.find((doc) => { return doc.id == this.state.docsSelected[0]});
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
          return doc.id == index;
      }
      this.setState({index: value.findIndex(findObjectIndex) });
    })
      .catch(error => {
        console.log(error);
      });
  }

  saveNewTags() {
    this.setState({ loadingTwo: ""});
    const object = {};
    object.id = this.state.id;
    object.title = this.state.title;
    object.updated = this.state.updated;
    object.tags = this.state.singleDocTags;
    object.content = this.state.content;
    object.sharedWith = this.state.sharedWith;
    const objectTwo = {};
    objectTwo.title = this.state.title;
    objectTwo.id = this.state.id;
    objectTwo.updated = this.state.updated;
    objectTwo.sharedWith = this.state.sharedWith;
    objectTwo.tags = this.state.singleDocTags
    const index = this.state.index;
    const updatedDoc = update(this.state.value, {$splice: [[index, 1, objectTwo]]});
    this.setState({value: updatedDoc, filteredValue: updatedDoc, singleDoc: object });
    setTimeout(this.saveFullCollectionTags, 500);
  }

  saveFullCollectionTags() {
    putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log("Saved");
        this.saveSingleDocTags();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveSingleDocTags() {
    const thisFile = this.state.docsSelected[0];
    const fullFile = '/documents/' + thisFile + '.json';
    putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
      .then(() => {
        console.log("Saved tags");
        this.setState({ tagModal: "hide", loadingTwo: "hide" });
        this.loadCollection();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  deleteTag() {
    console.log("Deleted");
    this.setState({ deleteState: false });

    let tags = this.state.singleDocTags;
    const thisTag = tags.find((tag) => { return tag.id == this.state.selectedTagId});
    let tagIndex = thisTag && thisTag.id;
    function findObjectIndex(tag) {
        return tag.id == tagIndex;
    }
    this.setState({ tagIndex: tags.findIndex(findObjectIndex) });
    this.setState({singleDocTags: update(this.state.singleDocTags, {$splice: [[this.state.tagIndex, 1]]})});
    // setTimeout(() => this.setState({singleDocTags: updatedTags }), 300);
  }

  applyFilter() {
    this.setState({ applyFilter: false });
    setTimeout(this.filterNow, 500);
  }

  filterNow() {
    let value = this.state.value;

    if(this.state.selectedTag != "") {
      let tagFilter = value.filter(x => typeof x.tags != 'undefined' ? x.tags.includes(this.state.selectedTag) : console.log("nada"));
      // let tagFilter = value.filter(x => x.tags.includes(this.state.selectedTag));
      this.setState({ filteredValue: tagFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (this.state.selectedDate != "") {
      let dateFilter = value.filter(x => x.updated.includes(this.state.selectedDate));
      this.setState({ filteredValue: dateFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (this.state.selectedCollab != "") {
      let collaboratorFilter = value.filter(x => typeof x.sharedWith != 'undefined' ? x.sharedWith.includes(this.state.selectedCollab) : console.log("nada"));
      // let collaboratorFilter = value.filter(x => x.sharedWith.includes(this.state.selectedCollab));
      this.setState({ filteredValue: collaboratorFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    }
  }


  render() {
    this.state.applyFilter === true ? this.applyFilter() : console.log("No filter applied");
    this.state.deleteState === true ? this.deleteTag() : console.log("no delete");
    this.state.tagDownload === true ? this.loadSingleTags() : console.log("no document selected");
    let value;
    this.state.filteredValue === [] ? value = [] : value = this.state.filteredValue;
    const { appliedFilter, selectedDate, selectedCollab, selectedTag, dateList, tagList, collaboratorsModal, singleDocTags, contactDisplay, loadingTwo, confirmAdd, contacts, shareModal, tagModal, currentPage, docsPerPage, loading } = this.state;
    const link = '/documents/doc/' + this.state.tempDocId;
    if (this.state.redirect) {
      return <Redirect push to={link} />;
    } else {
      console.log("No redirect");
    }
    confirmAdd === false ? console.log("Not sharing") : this.sharedInfo();
    const userData = loadUserData();
    const person = new Person(userData.profile);

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    const currentDocs = value.slice(0).reverse();
    console.log(currentDocs);
    let shared = currentDocs.map(a => a.sharedWith);
    let newShared = shared.filter(function(n){ return n != undefined });
    console.log("shared");
    console.log(shared);
    console.log(newShared);
    let mergedShared = [].concat.apply([], newShared);
    let uniqueCollabs = [];
    window.$.each(mergedShared, function(i, el){
      if(window.$.inArray(el, uniqueCollabs) === -1) uniqueCollabs.push(el);
    });

    let tags = currentDocs.map(a => a.tags);
    let newTags = tags.filter(function(n){ return n != undefined });
    let mergedTags = [].concat.apply([], newTags);
    let uniqueTags = [];
    window.$.each(mergedTags, function(i, el) {
      if(window.$.inArray(el, uniqueTags) === -1) uniqueTags.push(el);
    })

    let date = currentDocs.map(a => a.updated);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
      if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })


    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(value.length / docsPerPage); i++) {
     pageNumbers.push(i);
   }

   const renderPageNumbers = pageNumbers.map(number => {
          return (
            <li
              key={number}
              id={number}
              className={number === this.state.currentPage ? "active" : ""}
            >
              <a id={number} onClick={this.handlePageChange}>{number}</a>
            </li>
          );
        });

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

        <div className="docs">
        <div className="row container">
          <div className="col s12 m6">
            <h5>Documents ({currentDocs.length})
              {appliedFilter === false ? <span className="filter"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
              {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={() => this.setState({ appliedFilter: false, filteredValue: this.state.value})}>Clear</a></span> : <div />}
            </h5>
            {/* Filter Dropdown */}
            <ul id="slide-out" className="comments-side-nav side-nav">
              <h5 className="center-align">Filter</h5>
              <li><a onClick={() => this.setState({collaboratorsModal: ""})}>Collaborators</a></li>
                {/* Collaborator list */}
                  <ul className={collaboratorsModal}>
                  {
                    uniqueCollabs.map(collab => {
                      return (
                        <li className="filter-li" key={Math.random()}><a onClick={() => this.setState({ selectedCollab: collab, collaboratorsModal: "hide", applyFilter: true})}>{collab}</a></li>
                      )
                    })
                  }
                  </ul>
                {/* End Collaborator list */}
              <li><a onClick={() => this.setState({tagList: ""})}>Tags</a></li>
              {/* Tags list */}
                <ul className={tagList}>
                {
                  uniqueTags.map(tag => {
                    return (
                      <li className="filter-li" key={Math.random()}><a onClick={() => this.setState({ selectedTag: tag, tagList: "hide", applyFilter: true})}>{tag}</a></li>
                    )
                  })
                }
                </ul>
              {/* End Tag list */}
              <li><a onClick={() => this.setState({dateList: ""})}>Updated</a></li>
              {/* Date list */}
                <ul className={dateList}>
                {
                  uniqueDate.map(date => {
                    return (
                      <li className="filter-li" key={Math.random()}><a onClick={() => this.setState({ selectedDate: date, dateList: "hide", applyFilter: true})}>{date}</a></li>
                    )
                  })
                }
                </ul>
              {/* End Date list */}
            </ul>
            {/* End Filter Dropdown */}
          </div>
          <div className="col right s12 m6">
          <form className="searchform">
          <fieldset className=" form-group searchfield">
          <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Documents" onChange={this.filterList}/>
          </fieldset>
          </form>
          </div>
        </div>
          <div className="container">
            <div className={loading}>
              <div className="progress center-align">
                <p>Loading...</p>
                <div className="indeterminate"></div>
              </div>
            </div>
          </div>
        {/* Add button */}
        <div className="container">
          <div className="fixed-action-btn">
            <a onClick={this.handleaddItem} className="btn-floating btn-large black">
              <i className="large material-icons">add</i>
            </a>
        </div>
        {/* End Add Button */}
          {
            this.state.activeIndicator === true ?
              <ul className="pagination action-items">
                <li><a onClick={() => this.setState({shareModal: ""})}>Share</a></li>
                <li><a onClick={() => this.setState({tagDownload: true })}>Tag</a></li>

              </ul>
           :
              <ul className="pagination inactive action-items">
                <li><a>Share</a></li>
                <li><a>Tag</a></li>

              </ul>

          }

          <table className="bordered">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Collaborators</th>
                <th>Updated</th>
                <th>Tags</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
          {
            currentDocs.slice(indexOfFirstDoc, indexOfLastDoc).map(doc => {
              var tags;
              var collabs;
              if(doc.tags) {
                tags = Array.prototype.slice.call(doc.tags);
              } else {
                tags = "";
              }
              if(doc.sharedWith) {
                collabs = Array.prototype.slice.call(doc.sharedWith);
              } else {
                collabs = "";
              }
            return(
              <tr key={doc.id}>
                <td><input type="checkbox" checked={this.state.checked} value={doc.id} id={doc.id} onChange={this.handleCheckbox} /><label htmlFor={doc.id}></label></td>
                <td><Link to={'/documents/doc/' + doc.id}>{doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title}</Link></td>
                <td>{collabs === "" ? collabs : collabs.join(', ')}</td>
                <td>{doc.updated}</td>
                <td>{tags === "" ? tags : tags.join(', ')}</td>
                <td><Link to={'/documents/doc/delete/'+ doc.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></td>
              </tr>
            );
            })
          }
          </tbody>
        </table>

        <div>
          <ul className="center-align pagination">
          {renderPageNumbers}
          </ul>
          <div className="docs-per-page right-align">
            <label>Docs per page</label>
            <select value={this.state.docsPerPage} onChange={(event) => this.setState({ docsPerPage: event.target.value})}>
              <option value={10}>
              10
              </option>
              <option value={20}>
              20
              </option>
              <option value={50}>
              50
              </option>
            </select>
          </div>
        </div>
        {/* Share Modal */}
          <div className={shareModal}>
            <div id="modal1" className="project-page-modal modal">
              <div className="modal-content">
                <a onClick={() => this.setState({shareModal: "hide"})} className="btn-floating modalClose grey"><i className="material-icons">close</i></a>
                <div className={contactDisplay}>
                  <h4>Select Contact</h4>
                  <ul className="collection">
                  {contacts.slice(0).reverse().map(contact => {
                      return (
                        <li key={contact.contact}className="collection-item">
                          <a onClick={() => this.setState({ receiverID: contact.contact, confirmAdd: true, contactDisplay: "hide", loadingTwo: "" })}>
                          <p>{contact.contact}</p>
                          </a>
                        </li>
                      )
                    })
                  }
                  </ul>
                </div>
              </div>
              {/*loading */}
              <div className={loadingTwo}>
                <div className="center">
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
              {/*end loading */}
            </div>
          </div>
        {/* End Share Modal */}

        {/* Tag Modal */}
          <div className={tagModal}>
            <div id="modal1" className="project-page-modal modal">
              <div className="modal-content">
                <a onClick={() => this.setState({tagModal: "hide"})} className="btn-floating modalClose grey"><i className="material-icons">close</i></a>

                  <h4>Tags</h4>
                  <p>Add a new tag or remove an existing tag.</p>
                  <div className="row">
                    <div className="col s9">
                      <input type="text" value={this.state.tag} onChange={this.setTags} onKeyPress={this.handleKeyPress} />
                    </div>
                    <div className="col s3">
                      <a onClick={this.addTagManual}><i className="material-icons">check</i></a>
                    </div>
                  </div>
                  <div>
                  {singleDocTags.slice(0).reverse().map(tag => {
                      return (
                        <div key={tag} className="chip">
                          {tag}<a onClick={() => this.setState({selectedTagId: tag, deleteState: true})}><i className="close material-icons">close</i></a>
                        </div>
                      )
                    })
                  }
                  </div>
                  <div>
                    <button onClick={this.saveNewTags} className="btn">Save</button>
                  </div>
              </div>
              {/*loading */}
              <div className={loadingTwo}>
                <div className="center">
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
              {/*end loading */}
            </div>
          </div>
        {/* End tag Modal */}

        </div>
      </div>
      </div>
    );
  }
}
