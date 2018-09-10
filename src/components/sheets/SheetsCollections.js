import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
import Header from '../Header';
import update from 'immutability-helper';
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const { encryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SheetsCollections extends Component {
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
      sheets: [],
      grid: [
        [],
      ],
      title: "",
      sharedWith: [],
      tags: [],
      singleSheetTags: [],
      index: "",
      contacts: [],
      filteredSheets: [],
      tempSheetId: "",
      redirect: false,
      loading: "",
      alert: "",
      currentPage: 1,
      sheetsPerPage: 10,
      sheetsSelected: [],
      activeIndicator: false,
      loadingTwo: "hide",
      contactDisplay: "",
      shareModal: "hide",
      receiverID: "",
      pubKey: "",
      shareFile: [],
      id: "",
      updated: "",
      confirmAdd: false,
      migrationComplete: false,
      oldValue: [],
      migrationLength: 1,
      migrationCount: 0,
      migrateTitle: "",
      migrateContent: "",
      migrateID: "",
      migrateUpdated: "",
      singleSheet: {},
      tagDownload: false,
      tagModal: "hide",
      tag: "",
      selectedTagId: "",
      deleteState: false,
      sharedCollection: [],
      sharedWithSingle: [],
      appliedFilter: false,
      collaboratorsModal: "hide",
      tagList: "hide",
      dateList: "hide",
      selectedTag: "",
      selectedCollab: "",
      selectedDate: "",
      tagIndex: ""
    }
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
    this.filterList = this.filterList.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.sharedInfo = this.sharedInfo.bind(this);
    this.loadSharedCollection = this.loadSharedCollection.bind(this);
    this.share = this.share.bind(this);
    this.loadSingle = this.loadSingle.bind(this);
    this.saveCollection = this.saveCollection.bind(this);
    this.loadCollection = this.loadCollection.bind(this);
    this.loadSingleTags = this.loadSingleTags.bind(this);
    this.setTags = this.setTags.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.addTagManual = this.addTagManual.bind(this);
    this.saveNewTags = this.saveNewTags.bind(this);
    this.getCollectionTags =this.getCollectionTags.bind(this);
    this.saveFullCollectionTags = this.saveFullCollectionTags.bind(this);
    this.saveSingleSheetTags = this.saveSingleSheetTags.bind(this);
    this.getCollection = this.getCollection.bind(this);
    this.saveSharedFile = this.saveSharedFile.bind(this);
    this.saveSingleFile = this.saveSingleFile.bind(this);
    this.sendFile = this.sendFile.bind(this);
    this.deleteTag = this.deleteTag.bind(this);
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
  componentDidMount() {
    window.$('.modal').modal();
    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'left', // Choose the horizontal origin
      closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    }
  );
  const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey)
  putFile('key.json', JSON.stringify(publicKey), {encrypt: false})
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


  getFile('sheetsmigration.json', {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        this.setState({migrationComplete: JSON.parse(fileContents || '{}')})
      } else {
        this.setState({migrationComplete: false})
      }
    })
    .then(() => {
      this.loadCollection();
    })
    .catch(e => {
      console.log(e);
    });
}

loadCollection() {
  getFile("sheetscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
       this.setState({filteredSheets: this.state.sheets})
       this.setState({ loading: "hide" });
     } else {
       this.setState({ loading: "hide" });
     }
   })
    .catch(error => {
      console.log(error);
    });
}

migrateSheets() {
  getFile("spread.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       this.setState({ oldValue: JSON.parse(fileContents || '{}').sheets });

     } else {
       this.migrationComplete();
     }
   })
   .then(() => {
     if(this.state.oldValue.length > 0){
       this.setState({migrationLength: this.state.oldValue.length})
       this.startMigration();
     } else {
       this.migrationComplete();
     }
   })
    .catch(error => {
      console.log(error);
    });
}

startMigration() {
  const files = this.state.oldValue;
  this.setState({
    migrateTitle: files[this.state.migrationCount].title,
    migrateContent: files[this.state.migrationCount].content,
    migrateID: files[this.state.migrationCount].id,
    migrateUpdated: files[this.state.migrationCount].updated
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
  this.setState({ sheets: [...this.state.sheets, migrationObjectTwo]})
  this.setState({singleSheet: migrationObject})
  this.setState({tempDocId: migrationObject.id});
  this.saveMigrationCollection();
}

saveMigrationCollection() {
  putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt:true})
    .then(() => {
      this.saveMigrationSheet();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

saveMigrationSheet() {
  const file = this.state.tempDocId;
  const fullFile = '/sheets/' + file + '.json'

  putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt:true})
    .then(() => {
      this.setState({migrationCount: this.state.migrationCount + 1})
      if(this.state.migrationCount < this.state.oldValue.length) {
        this.startMigration();
      } else {
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
  putFile('sheetsmigration.json', JSON.stringify(this.state.migrationComplete), {encrypt: true})
    .then(() => {
      window.location.reload(true);
    })
}

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  handleaddItem() {
    const rando = Date.now();
    const object = {};
    object.title = "Untitled";
    object.content = [[]];
    object.id = rando;
    object.created = getMonthDayYear();
    object.sharedWith = [];
    object.tags = [];
    const objectTwo = {};
    objectTwo.title = object.title;
    objectTwo.id = object.id;
    objectTwo.created = object.created
    objectTwo.sharedWith = [];
    objectTwo.tags = [];
    this.setState({
      sheets: [...this.state.sheets, objectTwo],
      filteredSheets: [...this.state.filteredSheets, objectTwo],
      tempSheetId: object.id,
      singleSheet: object
     });
    setTimeout(this.saveNewFile, 500);
  }
  filterList(event){
    var updatedList = this.state.sheets;
    updatedList = updatedList.filter(function(item){
      return item.title.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    this.setState({filteredSheets: updatedList});
  }

  saveNewFile() {
    putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        this.saveSingleSheet();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
      });
  }

  saveSingleSheet() {
    const file = this.state.tempSheetId;
    const fullFile = '/sheets/' + file + '.json'
    putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt:true})
      .then(() => {
        this.setState({ redirect: true });
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  handleClick() {
    this.setState({ alert: "hide" })
  }

  handleCheckbox(event) {
    let checkedArray = this.state.sheetsSelected;
      let selectedValue = event.target.value;

        if (event.target.checked === true) {
          this.setState({activeIndicator: true});
        	checkedArray.push(selectedValue);
            this.setState({
              sheetsSelected: checkedArray
            });

        } else {
          this.setState({activeIndicator: false});
        	let valueIndex = checkedArray.indexOf(selectedValue);
			      checkedArray.splice(valueIndex, 1);

            this.setState({
              sheetsSelected: checkedArray
            });

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

  loadSharedCollection() {
    const user = this.state.receiverID;
    const file = "sharedsheets.json";
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
    if(this.state.sheetsSelected.length > 1) {
      //TODO figure out how to handle this
    } else {
      const thisFile = this.state.sheetsSelected[0];
      const fullFile = '/sheets/' + thisFile + '.json';

      getFile(fullFile, {decrypt: true})
       .then((fileContents) => {
         if(JSON.parse(fileContents || '{}').sharedWith) {
           this.setState({
             title: JSON.parse(fileContents || '{}').title,
             grid: JSON.parse(fileContents || '{}').content,
             tags: JSON.parse(fileContents || '{}').tags,
             updated: JSON.parse(fileContents || '{}').updated,
             id: JSON.parse(fileContents || '{}').id,
             sharedWithSingle: JSON.parse(fileContents || '{}').sharedWith
          });
        } else {
          this.setState({
            title: JSON.parse(fileContents || '{}').title,
            grid: JSON.parse(fileContents || '{}').content,
            tags: JSON.parse(fileContents || '{}').tags,
            updated: JSON.parse(fileContents || '{}').updated,
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
    getFile("sheetscollection.json", {decrypt: true})
    .then((fileContents) => {
       this.setState({ sheets: JSON.parse(fileContents || '{}').sheets })
       this.setState({ initialLoad: "hide" });
    }).then(() =>{
      let sheets = this.state.sheets;
      const thisSheet = sheets.find((sheet) => { return sheet.id.toString() === this.state.sheetsSelected[0]}); //this is comparing strings
      let index = thisSheet && thisSheet.id;
      function findObjectIndex(sheet) {
          return sheet.id === index; //this is comparing numbers
      }
      this.setState({index: sheets.findIndex(findObjectIndex) });
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
    object.content = this.state.grid;
    object.id = this.state.id;
    object.updated = this.state.updated;
    object.sharedWith = this.state.sharedWithSingle;
    object.tags = this.state.tags;
    const index = this.state.index;
    const updatedSheets = update(this.state.sheets, {$splice: [[index, 1, object]]});  // array.splice(start, deleteCount, item1)
    this.setState({sheets: updatedSheets, singleSheet: object, sharedCollection: [...this.state.sharedCollection, object]});

    setTimeout(this.saveSharedFile, 300);
  }

  saveSharedFile() {
    const user = this.state.receiverID;
    const file = "sharedsheets.json";

    putFile(user + file, JSON.stringify(this.state.sharedCollection), {encrypt: true})
      .then(() => {
        console.log("Shared Collection Saved");
        this.saveSingleFile();
      })
  }

  saveSingleFile() {
    const file = this.state.sheetsSelected[0];
    const fullFile = '/sheets/' + file + '.json'
    putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt:true})
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
    putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log("Saved");
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
    const fileName = 'sharedsheets.json'
    const file = userShort + fileName;
    const publicKey = this.state.pubKey;
    const data = this.state.sharedCollection;
    const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
    const directory = '/shared/' + file;
    putFile(directory, encryptedData, {encrypt: false})
      .then(() => {
        console.log("Shared encrypted file ");
        window.Materialize.toast('Sheet shared with ' + this.state.receiverID, 4000);
        this.loadCollection();
        this.setState({shareModal: "hide", loadingTwo: "hide", contactDisplay: ""});
        window.$('#shareModal').modal('close');
      })
      .catch(e => {
        console.log(e);
      });
  }

  loadSingleTags() {
    this.setState({tagDownload: false});
    const thisFile = this.state.sheetsSelected[0];
    const fullFile = '/sheets/' + thisFile + '.json';

    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       console.log(JSON.parse(fileContents || '{}'));
       if(JSON.parse(fileContents || '{}').tags) {
         this.setState({
           shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
           title: JSON.parse(fileContents || '{}').title,
           id: JSON.parse(fileContents || '{}').id,
           updated: JSON.parse(fileContents || '{}').updated,
           sharedWith: JSON.parse(fileContents || '{}').sharedWith,
           singleSheetTags: JSON.parse(fileContents || '{}').tags,
           grid: JSON.parse(fileContents || '{}').content
        });
      } else {
        this.setState({
          shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
          title: JSON.parse(fileContents || '{}').title,
          id: JSON.parse(fileContents || '{}').id,
          updated: JSON.parse(fileContents || '{}').updated,
          sharedWith: JSON.parse(fileContents || '{}').sharedWith,
          singleSheetTags: [],
          grid: JSON.parse(fileContents || '{}').content
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
    getFile("sheetscollection.json", {decrypt: true})
    .then((fileContents) => {
       this.setState({ sheets: JSON.parse(fileContents || '{}').sheets })
       this.setState({ initialLoad: "hide" });
    }).then(() =>{
      let sheets = this.state.sheets;
      const thisSheet = sheets.find((sheet) => { return sheet.id.toString() === this.state.sheetsSelected[0]}); //this is comparing strings
      let index = thisSheet && thisSheet.id;
      function findObjectIndex(sheet) {
          return sheet.id === index; //this is comparing numbers
      }
      this.setState({index: sheets.findIndex(findObjectIndex) });
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
    object.tags = this.state.singleSheetTags;
    object.content = this.state.grid;
    object.sharedWith = this.state.sharedWith;
    const objectTwo = {};
    objectTwo.title = this.state.title;
    objectTwo.id = this.state.id;
    objectTwo.updated = this.state.updated;
    objectTwo.sharedWith = this.state.sharedWith;
    objectTwo.tags = this.state.singleSheetTags
    const index = this.state.index;
    const updatedSheet = update(this.state.sheets, {$splice: [[index, 1, objectTwo]]});
    this.setState({sheets: updatedSheet, filteredSheets: updatedSheet, singleSheet: object });
    setTimeout(this.saveFullCollectionTags, 500);
  }

  saveFullCollectionTags() {
    putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log("Saved");
        this.saveSingleSheetTags();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveSingleSheetTags() {
    const thisFile = this.state.sheetsSelected[0];
    const fullFile = '/sheets/' + thisFile + '.json';
    putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt:true})
      .then(() => {
        console.log("Saved tags");
        this.setState({ tagModal: "hide", loadingTwo: "hide" });
        window.$('#tagModal').modal('close');
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

    let tags = this.state.singleSheetTags;
    const thisTag = tags.find((tag) => { return tag.id === this.state.selectedTagId}); //this is comparing strings
    let index = thisTag && thisTag.id;
    function findObjectIndex(tag) {
        return tag.id === index; //this is comparing numbers
    }
    this.setState({ tagIndex: tags.findIndex(findObjectIndex) });
    // setTimeout(this.finalDelete, 300);
    const updatedTags = update(this.state.singleSheetTags, {$splice: [[this.state.tagIndex, 1]]});
    this.setState({singleSheetTags: updatedTags });
  }

  setTags(e) {
    this.setState({ tag: e.target.value});
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.setState({ singleSheetTags: [...this.state.singleSheetTags, this.state.tag]});
      this.setState({ tag: "" });
    }
  }

  addTagManual() {
    this.setState({ singleSheetTags: [...this.state.singleSheetTags, this.state.tag]});
    this.setState({ tag: "" });
  }

  applyFilter() {
    this.setState({ applyFilter: false });
    setTimeout(this.filterNow, 500);
  }

  filterNow() {
    let sheets = this.state.sheets;
    if(this.state.selectedTag !== "") {
      let tagFilter = sheets.filter(x => typeof x.tags !== 'undefined' ? x.tags.includes(this.state.selectedTag) : console.log("nada"));
      // let tagFilter = sheets.filter(x => x.tags.includes(this.state.selectedTag));
      this.setState({ filteredSheets: tagFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (this.state.selectedDate !== "") {
      let dateFilter = sheets.filter(x => x.updated.includes(this.state.selectedDate));
      this.setState({ filteredSheets: dateFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (this.state.selectedCollab !== "") {
      let collaboratorFilter = sheets.filter(x => typeof x.sharedWith !== 'undefined' ? x.sharedWith.includes(this.state.selectedCollab) : console.log("nada"));
      // let collaboratorFilter = sheets.filter(x => x.sharedWith.includes(this.state.selectedCollab));
      this.setState({ filteredSheets: collaboratorFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    }
  }


  render() {
    this.state.deleteState === true ? this.deleteTag() : loadUserData();
    this.state.applyFilter === true ? this.applyFilter() : loadUserData();
    let sheets;
    this.state.filteredSheets === [] ? sheets = [] : sheets = this.state.filteredSheets;
    const { collaboratorsModal, tagList, dateList, appliedFilter, singleSheetTags, contactDisplay, loadingTwo, confirmAdd, contacts, currentPage, sheetsPerPage, loading } = this.state;
    const link = '/sheets/sheet/' + this.state.tempSheetId;
    if (this.state.redirect) {
      return <Redirect push to={link} />;
    }
    confirmAdd === false ? loadUserData() : this.sharedInfo();
    this.state.tagDownload === true ? this.loadSingleTags() : loadUserData();

    const indexOfLastSheet = currentPage * sheetsPerPage;
    const indexOfFirstSheet = indexOfLastSheet - sheetsPerPage;
    const currentSheets = sheets.slice(0).reverse();

    let shared = currentSheets.map(a => a.sharedWith);
    let newShared = shared.filter(function(n){ return n !== undefined });
    let mergedShared = [].concat.apply([], newShared);
    let uniqueCollabs = [];
    window.$.each(mergedShared, function(i, el){
      if(window.$.inArray(el, uniqueCollabs) === -1) uniqueCollabs.push(el);
    });

    let tags = currentSheets.map(a => a.tags);
    let newTags = tags.filter(function(n){ return n !== undefined });
    let mergedTags = [].concat.apply([], newTags);
    let uniqueTags = [];
    window.$.each(mergedTags, function(i, el) {
      if(window.$.inArray(el, uniqueTags) === -1) uniqueTags.push(el);
    })

    let date = currentSheets.map(a => a.updated);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
      if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })

    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(sheets.length / sheetsPerPage); i++) {
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
        <Header />
        <div className="docs">
        <div className="row container">
          <div className="col s12 m6">
            <h5>Sheets ({currentSheets.length})  <a onClick={this.handleaddItem} className="btn-floating btn black">
              <i className="material-icons">add</i>
            </a>

            {appliedFilter === false ? <span className="filter"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
            {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={() => this.setState({ appliedFilter: false, filteredSheets: this.state.sheets})}>Clear</a></span> : <div />}
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
          <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Sheets" onChange={this.filterList}/>
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
        <div className="container">

        {/*<div className="fixed-action-btn">
          <a onClick={this.handleaddItem} className="btn-floating btn-large black">
            <i className="large material-icons">add</i>
          </a>
        </div>*/}

        {
          this.state.activeIndicator === true ?
            <ul className="pagination action-items">
            <li><a className="modal-trigger" href="#shareModal">Share</a></li>
            <li><a className="modal-trigger" href="#tagModal" onClick={this.loadSingleTags}>Tag</a></li>
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
          currentSheets.slice(indexOfFirstSheet, indexOfLastSheet).map(sheet => {
            let collabs;
            if(sheet.sharedWith) {
              collabs = Array.prototype.slice.call(sheet.sharedWith);
            } else {
              collabs = "";
            }
            var tags;

            if(sheet.tags) {
              tags = Array.prototype.slice.call(sheet.tags);
            } else {
              tags = "";
            }
          return(
            <tr key={sheet.id}>
              <td><input type="checkbox" checked={this.state.checked} value={sheet.id} id={sheet.id} onChange={this.handleCheckbox} /><label htmlFor={sheet.id}></label></td>
              <td><Link to={'/sheets/sheet/'+ sheet.id}>{sheet.title.length > 20 ? sheet.title.substring(0,20)+"..." :  sheet.title}</Link></td>
              <td>{collabs === "" ? collabs : collabs.join(', ')}</td>
              <td>{sheet.updated}</td>
              <td>{tags === "" ? tags : tags.join(', ')}</td>
              <td><Link to={'/sheets/sheet/delete/'+ sheet.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></td>
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
          <label>Sheets per page</label>
          <select value={this.state.sheetsPerPage} onChange={(event) => this.setState({ sheetsPerPage: event.target.value})}>
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

          <div id="shareModal" className="project-page-modal modal">
            <div className="modal-content">
              <a className="btn-floating modal-action modal-close right grey"><i className="material-icons">close</i></a>
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

      {/* End Share Modal */}

      {/* Tag Modal */}

          <div id="tagModal" className="project-page-modal modal">
            <div className="modal-content">
              <a className="btn-floating modal-action modal-close right grey"><i className="material-icons">close</i></a>

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
                {singleSheetTags.slice(0).reverse().map(tag => {
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

      {/* End tag Modal */}
        </div>
      </div>
    </div>
    );
  }
}
