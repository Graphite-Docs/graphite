import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import Loading from '../Loading';
import { Container, Input, Grid, Button, Table, Message, Icon, Dropdown, Modal, Menu, Label, Sidebar, Item } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
import {
  analyticsRun
} from '../helpers/analytics';
import Header from '../Header';
import update from 'immutability-helper';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
import Joyride from "react-joyride";

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
      loading: false,
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
      tagIndex: "",
      visible: false,
      displayMessage: false,
      onboarding: false,
      run: false
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
    this.analyticsRun = analyticsRun.bind(this);
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }
  componentDidMount() {
    this.setState({ loading: true });
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

     } else {
       this.setState({ loading: false });
     }
   })
   .then(() => {
     this.setState({ loading: false });

   })
    .then(() => {
      getFile('sheetsPageOnboarding.json', {decrypt: true})
        .then((fileContents) => {
          if(fileContents) {
            this.setState({ onboardingComplete: JSON.parse(fileContents)})
          } else {
            this.setState({ onboardingComplete: false });
          }
        })
        .then(() => {
          this.checkFiles();
        })
    })
    .catch(error => {
      console.log(error);
    });
}

checkFiles = () => {
  if(this.props.sheets < 1) {
    if(!this.state.onboardingComplete) {
      this.setState({ run: true, onboardingComplete: true }, () => {
        putFile('sheetsPageOnboarding.json', JSON.stringify(this.state.onboardingComplete), {encrypt: true})
      });
    }
  } else {
    this.setState({ onboardingComplete: true }, () => {
      putFile('sheetsPageOnboarding.json', JSON.stringify(this.state.onboardingComplete), {encrypt: true})
    });
  }
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
    this.analyticsRun('sheets');
    const rando = Date.now();
    const object = {};
    object.title = "Untitled";
    object.content = [[]];
    object.id = rando;
    object.created = getMonthDayYear();
    object.updated = getMonthDayYear();
    object.sharedWith = [];
    object.tags = [];
    object.lastUpdate = Date.now();
    const objectTwo = {};
    objectTwo.title = object.title;
    objectTwo.id = object.id;
    objectTwo.created = object.created;
    objectTwo.updated = object.updated;
    objectTwo.sharedWith = [];
    objectTwo.tags = [];
    objectTwo.lastUpdate = Date.now();
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

  sharedInfo(contact, sheet) {
    this.setState({ loading: true, receiverID: contact, sharedWithSingle: [...this.state.sharedWithSingle, contact] });
    const user = contact;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

    getFile('key.json', options)
      .then((file) => {
        this.setState({ pubKey: JSON.parse(file)})
      })
        .then(() => {
          this.loadSharedCollection(contact);
        })
        .catch(error => {
          console.log("No key: " + error);
          this.setState({ displayMessage: true, loading: false}, () => {
            setTimeout(() => this.setState({ displayMessage: false}), 3000);
          });
        });
  }

  loadSharedCollection(contact, sheet) {
    const user = contact;
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
        this.share(contact, sheet);
      })
      .catch((error) => {
        console.log(error)
      });
  }

  loadSingle(sheet) {
    const thisFile = sheet.id;
    const fullFile = '/sheets/' + thisFile + '.json';

    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       console.log(JSON.parse(fileContents))
       if(JSON.parse(fileContents || '{}').sharedWith) {
         if(JSON.parse(fileContents).tags) {
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
            tags: [],
            updated: JSON.parse(fileContents || '{}').updated,
            id: JSON.parse(fileContents || '{}').id,
            sharedWithSingle: JSON.parse(fileContents || '{}').sharedWith
         });
        }

      } else {
        if(JSON.parse(fileContents).tags) {
          this.setState({
            title: JSON.parse(fileContents || '{}').title,
            grid: JSON.parse(fileContents || '{}').content,
            tags: JSON.parse(fileContents || '{}').tags,
            updated: JSON.parse(fileContents || '{}').updated,
            id: JSON.parse(fileContents || '{}').id,
            sharedWithSingle: [],
         });
       } else {
         this.setState({
           title: JSON.parse(fileContents || '{}').title,
           grid: JSON.parse(fileContents || '{}').content,
           tags: [],
           updated: JSON.parse(fileContents || '{}').updated,
           id: JSON.parse(fileContents || '{}').id,
           sharedWithSingle: [],
        });
       }

      }

     })
      .then(() => {
        this.getCollection(sheet)
      })
      .catch(error => {
        console.log(error);
      });
  }


  getCollection(sheet) {
    getFile("sheetscollection.json", {decrypt: true})
    .then((fileContents) => {
       this.setState({ sheets: JSON.parse(fileContents || '{}').sheets })
       this.setState({ initialLoad: "hide" });
    }).then(() =>{
      let sheets = this.state.sheets;
      const thisSheet = sheets.find((a) => { return a.id.toString() === sheet.id.toString()}); //this is comparing strings
      let index = thisSheet && thisSheet.id;
      function findObjectIndex(sheet) {
          return sheet.id === index; //this is comparing numbers
      }
      this.setState({index: sheets.findIndex(findObjectIndex) });
    })
      .then(() => {
        // this.share();
      })
      .catch(error => {
        console.log(error);
      });
  }

  share(contact, sheet) {
    const object = {};
    object.title = this.state.title;
    object.content = this.state.grid;
    object.id = this.state.id;
    object.updated = this.state.updated;
    object.sharedWith = this.state.sharedWithSingle;
    object.tags = this.state.tags;
    const index = this.state.index;
    const updatedSheets = update(this.state.sheets, {$splice: [[index, 1, object]]});  // array.splice(start, deleteCount, item1)
    this.setState({sheets: updatedSheets, singleSheet: object, sharedCollection: [...this.state.sharedCollection, object]}, () => {
      this.saveSharedFile(contact, sheet);
    });
  }

  saveSharedFile(contact, sheet) {
    const user = contact;
    const file = "sharedsheets.json";

    putFile(user + file, JSON.stringify(this.state.sharedCollection), {encrypt: true})
      .then(() => {
        console.log("Shared Collection Saved");
        this.saveSingleFile(contact, sheet);
      })
  }

  saveSingleFile(contact, sheet) {
    const file = this.state.id;
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
        this.setState({ loading: false }, () => {
          this.loadCollection();
        })

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

  saveNewTags(sheet) {
    this.setState({ loading: true});
    const object = {};
    object.id = this.state.id;
    object.title = this.state.title;
    object.updated = this.state.updated;
    object.tags = this.state.tags;
    object.content = this.state.grid;
    object.sharedWith = this.state.sharedWith;
    const objectTwo = {};
    objectTwo.title = this.state.title;
    objectTwo.id = this.state.id;
    objectTwo.updated = this.state.updated;
    objectTwo.sharedWith = this.state.sharedWith;
    objectTwo.tags = this.state.tags;
    const index = this.state.index;
    const updatedSheet = update(this.state.sheets, {$splice: [[index, 1, objectTwo]]});
    this.setState({sheets: updatedSheet, filteredSheets: updatedSheet, singleSheet: object }, () => {
      this.saveFullCollectionTags(sheet)
    });
  }

  saveFullCollectionTags(sheet) {
    putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log("Saved");
        this.saveSingleSheetTags(sheet);
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveSingleSheetTags() {
    const thisFile = this.state.id;
    const fullFile = '/sheets/' + thisFile + '.json';
    putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt:true})
      .then(() => {
        console.log("Saved tags");
        this.setState({ loading: false, singleSheetTags: [] });
        this.loadCollection();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  deleteTag(tag) {
    let singleDocTags = this.state.tags;
    const thisTag = singleDocTags.find((a) => { return a === tag});
    let tagIndex = thisTag;
    function findObjectIndex(a) {
        return a === tagIndex; //this is comparing numbers
    }
    this.setState({ tagIndex: singleDocTags.findIndex(findObjectIndex) }, () => {
      singleDocTags.splice(this.state.tagIndex, 1);
      this.setState({tags: singleDocTags});
    });
  }

  setTags(e) {
    this.setState({ tag: e.target.value});
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.setState({ tags: [...this.state.tags, this.state.tag]});
      this.setState({ tag: "" });
    }
  }

  addTagManual(sheet) {
    console.log(this.state.tag);
    console.log(this.state.tags);
    this.setState({ tags: [...this.state.tags, this.state.tag]}, () => {
      let sheets = this.state.sheets;
      const thisSheet = sheets.find((a) => { return a.id.toString() === sheet.id.toString()});
      let index = thisSheet && thisSheet.id;
      function findObjectIndex(sheet) {
          return sheet.id === index; //this is comparing numbers
      }
      this.setState({tagIndex: sheets.findIndex(findObjectIndex), tag: "" });
    });
  }

  applyFilter() {
    this.setState({ applyFilter: false });
    setTimeout(this.filterNow, 500);
  }

  filterNow(item, type) {
    let sheets = this.state.sheets;
    if(type === 'tag') {
      let tagFilter = sheets.filter(x => typeof x.tags !== 'undefined' ? x.tags.includes(item) : null);
      // let tagFilter = sheets.filter(x => x.tags.includes(this.state.selectedTag));
      this.setState({ filteredSheets: tagFilter, appliedFilter: true, visible: false});
    } else if(type === 'date') {
      let definedDate = sheets.filter((val) => { return val.updated !==undefined });
      let dateFilter = definedDate.filter(x => x.updated.includes(item));
      this.setState({ filteredSheets: dateFilter, appliedFilter: true, visible: false});
    } else if(type === 'collab') {
      let collaboratorFilter = sheets.filter(x => typeof x.sharedWith !== 'undefined' ? x.sharedWith.includes(item) : null);
      this.setState({ filteredSheets: collaboratorFilter, appliedFilter: true, visible: false});
    }
  }

 tagFilter = (props) => {
    let sheets = this.state.sheets;
    let tagFilter = sheets.filter(x => typeof x.tags !== 'undefined' ? x.tags.includes(props) : null);
    this.setState({ filteredValue: tagFilter, appliedFilter: true});
  }

collabFilter = (props) => {
  let sheets = this.state.sheets;
  let collaboratorFilter = sheets.filter(x => typeof x.sharedWith !== 'undefined' ? x.sharedWith.includes(props) : console.log(""));
  this.setState({ filteredValue: collaboratorFilter, appliedFilter: true});
}

dateFilter = (props) => {
  let sheets = this.state.sheets;
  let definedDate = sheets.filter((val) => { return val.updated !==undefined });
  let dateFilter = definedDate.filter(x => x.updated.includes(props));
  this.setState({ filteredValue: dateFilter, appliedFilter: true});
}

handleDeleteItem = (sheet) => {
  let sheets = this.state.sheets;
  const thisSheet = sheets.find((a) => { return a.id.toString() === sheet.id.toString()});
  let index = thisSheet && thisSheet.id;
  function findObjectIndex(sheet) {
      return sheet.id === index; //comparing numbers
  }
  this.setState({ title: thisSheet && thisSheet.title, index: sheets.findIndex(findObjectIndex) }, () => {
    if(this.state.index > -1) {
      sheets.splice(this.state.index,1);
    } else {
      console.log("Error with index")
    }

    this.setState({ sheets: sheets, singleSheet: {}, loading: true,  action: "Deleted document: " +  sheet.id}, () => {
      this.saveAfterDelete(sheet);
    })
  })


};

saveAfterDelete = (sheet) => {
  const thisFile = sheet.id;
  const fullFile = '/sheets/' + thisFile + '.json';
  putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt: true})
    .then(() => {
      putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt: true})
        .then(() => {
          this.setState({ loading: false });
          this.loadCollection();
        })
        .catch(e => {
          console.log("e");
          console.log(e);
        });
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

handlePageChange = (props) => {
  this.setState({
    currentPage: props
  });
}


  render() {
    const steps = [
      {
        content: <h2>This is where you will create and manage your sheets.</h2>,
        placement: "center",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: "body"
      },
      {
        content: <p>This is the sheets grid. Your existing sheets will be displayed here and can be accessed by clicking the sheet title.</p>,
        placement: "bottom",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: "table.table"
      },
      {
        content: <p>By clicking new, you will create a new sheet and be redirected into that sheet.</p>,
        placement: "top",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: ".column button.secondary"
      },
      {
        content: <p>You can filter by the creation date of your sheets, tags you have applied to your sheets, or the people you have shared with.</p>,
        placement: "bottom",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: ".filter a"
      },
      {
        content: <p>The search box lets you search across all your sheets. Just start typing the title you are looking for.</p>,
        placement: "bottom",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: ".input input"
      }
    ]


    this.state.deleteState === true ? this.deleteTag() : loadUserData();
    this.state.applyFilter === true ? this.applyFilter() : loadUserData();
    let sheets;
    this.state.filteredSheets === [] ? sheets = [] : sheets = this.state.filteredSheets;
    const { displayMessage, loading, visible, appliedFilter, contacts, currentPage, sheetsPerPage } = this.state;
    const { results } = this.props;
    let contactResults;
    if(results) {
      contactResults = results;
    } else {
      contactResults = [];
    }
    const link = '/sheets/sheet/' + this.state.tempSheetId;
    if (this.state.redirect) {
      return <Redirect push to={link} />;
    }
    // confirmAdd === false ? loadUserData() : this.sharedInfo();
    this.state.tagDownload === true ? this.loadSingleTags() : loadUserData();

    const indexOfLastSheet = currentPage * sheetsPerPage;
    const indexOfFirstSheet = indexOfLastSheet - sheetsPerPage;
    let currentSheets;
    if(sheets) {
      currentSheets = sheets;
    } else {
      currentSheets = [];
    }

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
   for (let i = 1; i <= Math.ceil(currentSheets.length / sheetsPerPage); i++) {
     pageNumbers.push(i);
   }

   const renderPageNumbers = pageNumbers.map(number => {
          return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.state.currentPage.toString() === number.toString()} onClick={() => this.handlePageChange(number)} />
          );
        });

    if(!loading && !this.props.loading) {
      return (
        <div>
          <Header />
          <Container style={{marginTop:"65px"}}>
          <Joyride
            continuous
            scrollToFirstStep
            showProgress
            showSkipButton
            run={this.state.run}
            steps={steps}
            callback={this.handleJoyrideCallback}
          />
          <Grid stackable style={{marginBottom: "25px"}} columns={2}>
            <Grid.Column>
              <h2>Sheets ({currentSheets.length})
                <Button onClick={this.handleaddItem} style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button>
                {appliedFilter === false ? <span className="filter"><a onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer"}}>Filter<Icon name='caret down' /></a></span> : <span className="hide"><a>Filter</a></span>}
                {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={() => this.setState({ appliedFilter: false, visible: false, filteredSheets: this.state.sheets})}>Clear</Label></span> : <div />}
              </h2>
            </Grid.Column>
            <Grid.Column>
              <Input onChange={this.filterList} icon='search' placeholder='Search...' />
            </Grid.Column>
          </Grid>

          <Sidebar
            as={Menu}
            animation='overlay'
            icon='labeled'
            inverted
            onHide={() => this.setState({ visible: false })}
            vertical
            visible={visible}
            width='thin'
            style={{width: "250px"}}
          >
          <Menu.Item as='a'>
            Tags
            <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
              <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
              {
                uniqueTags.map(tag => {
                  return (
                    <Dropdown.Item key={Math.random()} text={tag} onClick={() => this.filterNow(tag, 'tag')} />
                  )
                })
              }
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
          <Menu.Item as='a'>
            Collaborators
            <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
              <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
              {
                uniqueCollabs.map(collab => {
                  return (
                    <Dropdown.Item key={Math.random()} text={collab} onClick={() => this.filterNow(collab, 'collab')} />
                  )
                })

              }
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
          <Menu.Item as='a'>
            Date
            <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
              <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
              {
                uniqueDate.map(date => {
                  return (
                    <Dropdown.Item key={Math.random()} text={date} onClick={() => this.filterNow(date, 'date')} />
                  )
                })

              }
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        </Sidebar>

          <div className="docs">

          <div className="container">

          <Table unstackable style={{borderRadius: "0"}}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Collaborators</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Updated</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Tags</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
          {
            currentSheets.slice(indexOfFirstSheet, indexOfLastSheet).reverse().map(sheet => {
              let collabs;
              let uniqueCollaborators;
              if(sheet.sharedWith) {
                collabs = Array.prototype.slice.call(sheet.sharedWith);
                uniqueCollaborators = collabs.filter((thing, index, self) => self.findIndex(t => t === thing) === index)
              } else {
                collabs = "";
                uniqueCollaborators = "";
              }
              var gridTags;

              if(sheet.tags) {
                gridTags = Array.prototype.slice.call(sheet.tags);
              } else if(sheet.singleSheetTags) {
                gridTags = Array.prototype.slice.call(sheet.singleSheetTags);
              } else {
                gridTags = [];
              }
            return(
              <Table.Row key={sheet.id}>
                <Table.Cell><Link to={'/sheets/sheet/'+ sheet.id}>{sheet.title ? sheet.title.length > 20 ? sheet.title.substring(0,20)+"..." :  sheet.title : "Untitled"}</Link></Table.Cell>
                <Table.Cell>{uniqueCollaborators === "" ? uniqueCollaborators : uniqueCollaborators.join(', ')}</Table.Cell>
                <Table.Cell>{sheet.updated}</Table.Cell>
                <Table.Cell>{gridTags === "" ? gridTags : gridTags.join(', ')}</Table.Cell>
                <Table.Cell>
                  <Dropdown icon='ellipsis vertical' className='actions'>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <Modal closeIcon style={{borderRadius: "0"}} trigger={<a onClick={() => this.loadSingle(sheet)} style={{color: "#282828"}}><Icon name='share alternate'/>Share</a>}>
                          <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Sheet</Modal.Header>
                          <Modal.Content>
                            <Modal.Description>
                              <h3>Search for a contact</h3>
                              <Input icon='users' iconPosition='left' placeholder='Search users...' onChange={this.props.handleNewContact} />
                              <Item.Group divided>
                              {contactResults.map(result => {
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
                                      <Item className="contact-search" onClick={() => this.sharedInfo(result.fullyQualifiedName, sheet)} key={result.username}>
                                      <Item.Image size='tiny' src={imageLink} />
                                      <Item.Content verticalAlign='middle'>{result.username}</Item.Content>
                                      </Item>
                                      )
                                    }
                                  )
                              }
                              </Item.Group>
                              <hr />
                              <Item.Group divided>
                              <h4>Your Contacts</h4>
                              {contacts.slice(0).reverse().map(contact => {
                                return (
                                  <Item className="contact-search" onClick={() => this.sharedInfo(contact.contact, sheet)} key={contact.contact}>
                                    <Item.Image size='tiny' src={contact.img} />
                                    <Item.Content verticalAlign='middle'>{contact.contact}</Item.Content>
                                  </Item>
                                )
                              })
                            }
                            </Item.Group>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <Modal closeIcon trigger={<Link onClick={() => this.loadSingle(sheet)} to={'/sheets'} style={{color: "#282828"}}><Icon name='tag'/>Tag</Link>}>
                          <Modal.Header>Manage Tags</Modal.Header>
                          <Modal.Content>
                            <Modal.Description>
                            <Input placeholder='Type a tag...' value={this.state.tag} onChange={this.setTags} />
                            <Button onClick={() => this.addTagManual(sheet)} style={{borderRadius: "0"}}>Add Tag</Button><br/>
                            {
                              this.state.tags ? this.state.tags.slice(0).reverse().map(tag => {
                                return (
                                  <Label style={{marginTop: "10px"}} key={tag} as='a' tag>
                                    {tag}
                                    <Icon onClick={() => this.deleteTag(tag)} name='delete' />
                                  </Label>
                                )
                              }) :
                              null
                            }
                            <div>
                              <Button style={{background: "#282828", color: "#fff", borderRadius: "0", marginTop: "15px"}} onClick={() => this.saveNewTags(sheet)}>Save Tags</Button>
                            </div>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item>
                        <Modal open={this.state.open} trigger={
                          <a onClick={() => this.loadSingle(sheet)} to={'/documents'} style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</a>
                        } basic size='small'>
                          <SemanticHeader icon='trash alternate outline' content={sheet.title ? 'Delete ' + sheet.title + '?' : 'Delete sheet?'} />
                          <Modal.Content>
                            <p>
                              The sheet cannot be restored.
                            </p>
                          </Modal.Content>
                          <Modal.Actions>
                            <div>
                              {
                                this.state.loading ?
                                <Loading style={{bottom: "0"}} /> :
                                <div>
                                  <Button onClick={() => this.setState({ visible: false })} basic color='red' inverted>
                                    <Icon name='remove' /> No
                                  </Button>
                                  <Button onClick={() => this.handleDeleteItem(sheet)} color='red' inverted>
                                    <Icon name='checkmark' /> Delete
                                  </Button>
                                </div>
                              }
                            </div>
                          </Modal.Actions>
                        </Modal>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Table.Cell>
              </Table.Row>
            );
            })
          }
          </Table.Body>
        </Table>
        {
          pageNumbers.length > 0 ?
          <div style={{maxWidth: "50%", margin:"auto"}}>
            <Menu pagination>
            {renderPageNumbers}
            </Menu>
          </div> :
          <div />
        }
          <div style={{float: "right", marginBottom: "25px"}}>
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
        {displayMessage ?
          <Message
            style={{borderRadius: "0", background: "#282828", bottom: "200px", color: "#fff"}}
            header='This user has not yet logged into Graphite'
            content='Ask them to log in first so that you can share encrypted files.'
          /> :
          null
        }
          </div>
        </Container>
      </div>
      );
    } else {
      return (
        <Loading />
      )
    }
  }
}
