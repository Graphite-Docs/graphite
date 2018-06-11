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
import ReactQuill from 'react-quill';
const Font = ReactQuill.Quill.import('formats/font');
const remoteStorage = new RemoteStorage({logging: false});
const widget = new Widget(remoteStorage);
const { getPublicKeyFromPrivate } = require('blockstack');
const { encryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
const Y = require('yjs')
require('y-memory')(Y) // extend Y with the memory module
require('y-websockets-client')(Y)
require('y-array')(Y)
require('y-map')(Y)

Font.whitelist = ['Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
ReactQuill.Quill.register(Font, true);

export default class TestDoc extends Component {
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
      appliedFilter: false
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
    Y({
      db: {
        name: 'memory' // store the shared data in memory
      },
      connector: {
        name: 'websockets-client', // use the websockets connector
        room: 'my room'            // Instances connected to the same room share data
        // url: 'localhost:1234' // specify your own server destination
      },
      share: { // specify the shared content
        map: 'Map',    // y.share.map is of type Y.Map
        array: 'Array' // y.share.array is of type Y.Array
      },
      sourceDir: '/bower_components' // where the modules are (browser only)
    }).then(function (y) {
      /*
        At this point Yjs is successfully initialized.
        Try it out in your browser console!
      */
      window.y = y
      console.log('Yjs instance ready!')
      y.share.map // is an Y.Map instance
      y.share.array // is an Y.Array instance
      var map = y.share.map

      // Set an observer
      map.observe(function(event){
        console.dir(event)
      })

      // create a new property (add)
      map.set('number', JSON.stringify(this.state.content))
      map.get('number')
    })
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
        this.setState({shareModal: "hide", loadingTwo: "", contactDisplay: ""});
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
    let index = thisTag && thisTag.id;
    function findObjectIndex(tag) {
        return tag.id == index;
    }
    this.setState({ index: tags.findIndex(findObjectIndex) });
    // setTimeout(this.finalDelete, 300);
    const updatedTags = update(this.state.singleDocTags, {$splice: [[this.state.index, 1]]});
    this.setState({singleDocTags: updatedTags });
  }

  applyFilter() {
    this.setState({ applyFilter: false });
    setTimeout(this.filterNow, 500);
  }

  filterNow() {
    let value = this.state.value;

    if(this.state.selectedTag != "") {
      let tagFilter = value.filter(x => x.tags.includes(this.state.selectedTag));
      this.setState({ filteredValue: tagFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (this.state.selectedDate != "") {
      let dateFilter = value.filter(x => x.updated.includes(this.state.selectedDate));
      this.setState({ filteredValue: dateFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (this.state.selectedCollab != "") {
      let collaboratorFilter = value.filter(x => x.sharedWith.includes(this.state.selectedCollab));
      this.setState({ filteredValue: collaboratorFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    }
  }


  render() {
    TestDoc.modules = {
      toolbar: [
        //[{ font: Font.whitelist }],
        [{ header: 1 }, { header: 2 }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ align: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        ['video'],
        ['image'],
        ['link'],
      ],
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
      }
    }

    return (
      <div>
      <ReactQuill
        ref={(el) => { this.reactQuillRef = el }}
        modules={TestDoc.modules}
        id="textarea1"
        className="materialize-textarea"
        placeholder="Write something great"
        value={this.state.content}
        onChange={this.handleChange}
        theme="bubble" />
      </div>
    );
  }
}
