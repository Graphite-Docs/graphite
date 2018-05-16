import React, { Component } from 'react';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
import { Link } from 'react-router-dom';
import update from 'immutability-helper';
const { getPublicKeyFromPrivate } = require('blockstack');
const { encryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class TestVault extends Component {
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
      files: [],
      filteredValue: [],
      folders: [],
      docs: [],
      sheets: [],
      combined: [],
      currentPage: 1,
      filesPerPage: 10,
      appliedFilter: false,
      activeIndicator: false,
      filesSelected: [],
      shareModal: "hide",
      contactDisplay: "",
      contacts: [],
      loadingTwo: "hide",
      receiverID: "",
      confirmAdd: false,
      pubKey: "",
      sharedCollection: [],
      sharedWithSingle: [],
      index: "",
      file: "",
      name: "",
      lastModifiedDate: "",
      link: "",
      type: "",
      tags: [],
      singleFile: {},
      tagDownload: false,
      singleFileTags: [],
      tagModal: "hide",
      shareFile: [],
      tag: "",
      selectedTagId: "",
      deleteState: false,
      collaboratorsModal: "hide",
      tagList: "hide",
      dateList: "hide",
      uploaded: "",
      typeList: "hide",
      selectedType: "",
      applyFilter: false,
      selectedType: "",
      selectedTag: "",
      selectedCollab: "",
      selectedDate: ""
  	};
    this.filterList = this.filterList.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.loadCollection = this.loadCollection.bind(this);
    this.sharedInfo = this.sharedInfo.bind(this);
    this.loadSharedCollection = this.loadSharedCollection.bind(this);
    this.loadSingle = this.loadSingle.bind(this);
    this.getCollection = this.getCollection.bind(this);
    this.share = this.share.bind(this);
    this.saveSharedFile =this.saveSharedFile.bind(this);
    this.saveSingleFile = this.saveSingleFile.bind(this);
    this.saveCollection = this.saveCollection.bind(this);
    this.sendFile = this.sendFile.bind(this);
    this.loadSingleTags = this.loadSingleTags.bind(this);
    this.getCollectionTags = this.getCollectionTags.bind(this);
    this.setTags = this.setTags.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.addTagManual = this.addTagManual.bind(this);
    this.saveNewTags = this.saveNewTags.bind(this);
    this.saveFullCollectionTags = this.saveFullCollectionTags.bind(this);
    this.saveSingleFileTags = this.saveSingleFileTags.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.filterNow = this.filterNow.bind(this);
    this.deleteTag = this.deleteTag.bind(this);
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

  loadCollection() {
    getFile("uploads.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents){
         this.setState({ files: JSON.parse(fileContents || '{}') });
         this.setState({filteredValue: this.state.files});
       }else {
         this.setState({ files: [] });
         this.setState({filteredValue: []});
       }
     })
      .catch(error => {
        console.log(error);
        this.setState({ files: [], filteredValue: [] });
      });
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  filterList(event){
    var updatedList = this.state.files;
    updatedList = updatedList.filter(function(item){
      return item.name.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    this.setState({filteredValue: updatedList});
  }

  handlePageChange(event) {
    this.setState({
      currentPage: Number(event.target.id)
    });
  }

  handleCheckbox(event) {
    let checkedArray = this.state.filesSelected;
      let selectedValue = event.target.value;

        if (event.target.checked === true) {
        	checkedArray.push(selectedValue);
            this.setState({
              filesSelected: checkedArray
            });
          if(checkedArray.length === 1) {
            this.setState({activeIndicator: true});
            console.log(checkedArray)

          } else {
            this.setState({activeIndicator: false});
          }
        } else {
          this.setState({activeIndicator: false});
        	let valueIndex = checkedArray.indexOf(selectedValue);
			      checkedArray.splice(valueIndex, 1);

            this.setState({
              filesSelected: checkedArray
            });
            if(checkedArray.length === 1) {
              this.setState({activeIndicator: true});
            } else {
              this.setState({activeIndicator: false});
            }
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
    const file = "sharedvault.json";
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
    if(this.state.filesSelected.length > 1) {
      //TODO figure out how to handle this
    } else {
      const thisFile = this.state.filesSelected[0];
      const fullFile = thisFile + '.json';
      const fullFileSharedWith = thisFile + 'sharedwith.json';

      getFile(fullFile, {decrypt: true})
       .then((fileContents) => {
         if(JSON.parse(fileContents || '{}').sharedWith) {
           this.setState({
             file: JSON.parse(fileContents || "{}").file,
             name: JSON.parse(fileContents || "{}").name,
             lastModifiedDate: JSON.parse(fileContents || "{}").lastModifiedDate,
             size: JSON.parse(fileContents || "{}").size,
             link: JSON.parse(fileContents || "{}").link,
             type: JSON.parse(fileContents || "{}").type,
             id: JSON.parse(fileContents || "{}").id,
             sharedWithSingle: JSON.parse(fileContents || "{}").sharedWith,
             singleFileTags: JSON.parse(fileContents || "{}").tags,
             uploaded: JSON.parse(fileContents || "{}").uploaded
          });
        } else {
          this.setState({
            file: JSON.parse(fileContents || "{}").file,
            name: JSON.parse(fileContents || "{}").name,
            lastModifiedDate: JSON.parse(fileContents || "{}").lastModifiedDate,
            size: JSON.parse(fileContents || "{}").size,
            link: JSON.parse(fileContents || "{}").link,
            id: JSON.parse(fileContents || "{}").id,
            type: JSON.parse(fileContents || "{}").type,
            sharedWithSingle: [],
            singleFileTags: JSON.parse(fileContents || "{}").tags,
            uploaded: JSON.parse(fileContents || "{}").uploaded
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
    getFile("uploads.json", {decrypt: true})
    .then((fileContents) => {
       this.setState({ files: JSON.parse(fileContents || '{}') })
       this.setState({ initialLoad: "hide" });
    }).then(() =>{
      let files = this.state.files;
      console.log("files man")
      console.log(files);
      const thisFile = files.find((file) => { return file.id == this.state.filesSelected[0]});
      let index = thisFile && thisFile.id;
      function findObjectIndex(file) {
          return file.id == index;
      }
      this.setState({index: files.findIndex(findObjectIndex) });
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
    object.name = this.state.name;
    object.file = this.state.file;
    object.id = this.state.id;
    object.lastModifiedDate = this.state.lastModifiedDate;
    object.sharedWith = this.state.sharedWithSingle;
    object.size = this.state.size;
    object.link = this.state.link;
    object.type = this.state.type;
    object.tags = this.state.singleFileTags;
    object.uploaded = this.state.uploaded;
    const index = this.state.index;
    const updatedFiles = update(this.state.files, {$splice: [[index, 1, object]]});  // array.splice(start, deleteCount, item1)
    this.setState({files: updatedFiles, singleFile: object, sharedCollection: [...this.state.sharedCollection, object]});

    setTimeout(this.saveSharedFile, 300);
  }

  saveSharedFile() {
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const file = "sharedvault.json";

    putFile(userShort + file, JSON.stringify(this.state.sharedCollection), {encrypt: true})
      .then(() => {
        console.log("Shared Collection Saved");
        this.saveSingleFile();
      })
  }

  saveSingleFile() {
    const file = this.state.filesSelected[0];
    const fullFile = file + '.json'
    putFile(fullFile, JSON.stringify(this.state.singleFile), {encrypt:true})
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
    putFile("uploads.json", JSON.stringify(this.state.files), {encrypt: true})
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
    const fileName = 'sharedvault.json'
    const file = userShort + fileName;
    const publicKey = this.state.pubKey;
    const data = this.state.sharedCollection;
    const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
    const directory = '/shared/' + file;
    putFile(directory, encryptedData, {encrypt: false})
      .then(() => {
        console.log("Shared encrypted file ");
        window.Materialize.toast('File shared with ' + this.state.receiverID, 4000);
        this.loadCollection();
        this.setState({shareModal: "hide", loadingTwo: "", contactDisplay: ""});
      })
      .catch(e => {
        console.log(e);
      });
  }

  loadSingleTags() {
    this.setState({tagDownload: false});
    const thisFile = this.state.filesSelected[0];
    const fullFile = thisFile + '.json';

    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       console.log(JSON.parse(fileContents || '{}'));
       if(JSON.parse(fileContents || '{}').tags) {
         this.setState({
           shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
           name: JSON.parse(fileContents || '{}').name,
           id: JSON.parse(fileContents || '{}').id,
           lastModifiedDate: JSON.parse(fileContents || '{}').lastModifiedDate,
           sharedWithSingle: JSON.parse(fileContents || '{}').sharedWith,
           singleFileTags: JSON.parse(fileContents || '{}').tags,
           file: JSON.parse(fileContents || "{}").file,
           size: JSON.parse(fileContents || "{}").size,
           link: JSON.parse(fileContents || "{}").link,
           type: JSON.parse(fileContents || "{}").type,
           uploaded: JSON.parse(fileContents || "{}").uploaded
        });
      } else {
        this.setState({
          shareFile: [...this.state.shareFile, JSON.parse(fileContents || '{}')],
          name: JSON.parse(fileContents || '{}').name,
          id: JSON.parse(fileContents || '{}').id,
          lastModifiedDate: JSON.parse(fileContents || '{}').lastModifiedDate,
          sharedWithSingle: JSON.parse(fileContents || '{}').sharedWith,
          singleFileTags: [],
          file: JSON.parse(fileContents || "{}").file,
          size: JSON.parse(fileContents || "{}").size,
          link: JSON.parse(fileContents || "{}").link,
          type: JSON.parse(fileContents || "{}").type,
          uploaded: JSON.parse(fileContents || "{}").uploaded
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
    getFile("uploads.json", {decrypt: true})
    .then((fileContents) => {
       this.setState({ files: JSON.parse(fileContents || '{}') })
       this.setState({ initialLoad: "hide" });
    }).then(() =>{
      let files = this.state.files;
      const thisFile = files.find((file) => { return file.id == this.state.filesSelected[0]});
      let index = thisFile && thisFile.id;
      function findObjectIndex(file) {
          return file.id == index;
      }
      this.setState({index: files.findIndex(findObjectIndex) });
    })
      .catch(error => {
        console.log(error);
      });
  }

  setTags(e) {
    this.setState({ tag: e.target.value});
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      const object = {};
      this.setState({ singleFileTags: [...this.state.singleFileTags, this.state.tag]});
      this.setState({ tag: "" });
    }
  }

  addTagManual() {
    this.setState({ singleFileTags: [...this.state.singleDocTags, this.state.tag]});
    this.setState({ tag: "" });
  }

  saveNewTags() {
    this.setState({ loadingTwo: ""});
    const object = {};
    object.name = this.state.name;
    object.file = this.state.file;
    object.id = this.state.id;
    object.lastModifiedDate = this.state.lastModifiedDate;
    object.sharedWith = this.state.sharedWithSingle;
    object.size = this.state.size;
    object.link = this.state.link;
    object.type = this.state.type;
    object.tags = this.state.singleFileTags;
    object.uploaded = this.state.uploaded;
    const index = this.state.index;
    const objectTwo = {};
    objectTwo.name = this.state.name;
    objectTwo.file = this.state.file;
    objectTwo.id = this.state.id;
    objectTwo.lastModifiedDate = this.state.lastModifiedDate;
    objectTwo.sharedWith = this.state.sharedWithSingle;
    objectTwo.tags = this.state.singleFileTags;
    objectTwo.type = this.state.type;
    objectTwo.uploaded = this.state.uploaded;
    const updatedFile = update(this.state.files, {$splice: [[index, 1, objectTwo]]});
    this.setState({files: updatedFile, filteredValue: updatedFile, singleFile: object });
    setTimeout(this.saveFullCollectionTags, 500);
  }

  saveFullCollectionTags() {
    putFile("uploads.json", JSON.stringify(this.state.files), {encrypt: true})
      .then(() => {
        console.log("Saved");
        this.saveSingleFileTags();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveSingleFileTags() {
    const thisFile = this.state.filesSelected[0];
    const fullFile = thisFile + '.json';
    putFile(fullFile, JSON.stringify(this.state.singleFile), {encrypt:true})
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

  applyFilter() {
    this.setState({ applyFilter: false });
    setTimeout(this.filterNow, 500);
  }

  filterNow() {
    let files = this.state.files;

    if(this.state.selectedTag != "") {
      let tagFilter = files.filter(x => x.tags.includes(this.state.selectedTag));
      this.setState({ filteredValue: tagFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (this.state.selectedDate != "") {
      let dateFilter = files.filter(x => x.updated.includes(this.state.selectedDate));
      this.setState({ filteredValue: dateFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (this.state.selectedCollab != "") {
      let collaboratorFilter = files.filter(x => x.sharedWith.includes(this.state.selectedCollab));
      this.setState({ filteredValue: collaboratorFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if(this.state.selectedType) {
      let typeFilter = files.filter(x => x.type.includes(this.state.selectedType));
      this.setState({ filteredValue: typeFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    }
  }

  deleteTag() {
    console.log("Deleted");
    this.setState({ deleteState: false });

    let tags = this.state.singleFileTags;
    const thisTag = tags.find((tag) => { return tag.id == this.state.selectedTagId});
    let index = thisTag && thisTag.id;
    function findObjectIndex(tag) {
        return tag.id == index;
    }
    this.setState({ index: tags.findIndex(findObjectIndex) });
    // setTimeout(this.finalDelete, 300);
    const updatedTags = update(this.state.singleFileTags, {$splice: [[this.state.index, 1]]});
    this.setState({singleFileTags: updatedTags });
  }

  render() {
    const { deleteState, applyFilter, typeList, collaboratorsModal, tagList, dateList, singleFileTags, tagModal, tagDownload, confirmAdd, loadingTwo, contacts, contactDisplay, shareModal, appliedFilter, person, currentPage, filesPerPage } = this.state;
    let files;
    if (this.state.filteredValue !=null) {
      files = this.state.filteredValue;
    } else {
      files = [];
    }

    deleteState === true ? this.deleteTag() : console.log("no delete");
    tagDownload === true ? this.loadSingleTags() : console.log("no document selected");
    confirmAdd === false ? console.log("Not sharing") : this.sharedInfo();
    applyFilter === true ? this.applyFilter() : console.log("No filter applied");

    const indexOfLastFile = currentPage * filesPerPage;
    const indexOfFirstFile = indexOfLastFile - filesPerPage;
    const currentFiles = files.slice(0).reverse();

    let shared = currentFiles.map(a => a.sharedWith);
    let mergedShared = [].concat.apply([], shared);
    let uniqueCollabs = [];
    window.$.each(mergedShared, function(i, el){
      if(window.$.inArray(el, uniqueCollabs) === -1) uniqueCollabs.push(el);
    });

    let tags = currentFiles.map(a => a.tags);
    let mergedTags = [].concat.apply([], tags);
    let uniqueTags = [];
    window.$.each(mergedTags, function(i, el) {
      if(window.$.inArray(el, uniqueTags) === -1) uniqueTags.push(el);
    })

    let date = currentFiles.map(a => a.uploaded);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
      if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })

    let type = currentFiles.map(a => a.type);
    let mergedType = [].concat.apply([], type);
    let uniqueType = [];
    window.$.each(mergedType, function(i, el) {
      if(window.$.inArray(el, uniqueType) === -1) uniqueType.push(el);
    })

    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(files.length / filesPerPage); i++) {
     pageNumbers.push(i);
   }

   console.log(this.state.selectedCollab);

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
      !isSignInPending() ?
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="https://i.imgur.com/shB70Sn.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
              <li><a href="/shared-vault">Shared Files</a></li>

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
          <h5>Files ({currentFiles.length})
            {appliedFilter === false ? <span className="filter"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
            {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={() => this.setState({ appliedFilter: false, filteredValue: this.state.files})}>Clear</a></span> : <div />}
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
            <li><a onClick={() => this.setState({typeList: ""})}>Type</a></li>
            {/* Type list */}
              <ul className={typeList}>
              {
                uniqueType.map(type => {
                  return (
                    <li className="filter-li" key={Math.random()}><a onClick={() => this.setState({ selectedType: type, typeList: "hide", applyFilter: true})}>{type.split('/')[1].toUpperCase()}</a></li>
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
          <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Files" onChange={this.filterList}/>
          </fieldset>
          </form>
        </div>
      </div>

        <div className="">
        <div className="container">
          <div className="fixed-action-btn">
            <a href='/vault/new/file' className="btn-floating btn-large black">
              <i className="large material-icons">add</i>
            </a>
        </div>

        {
          this.state.activeIndicator === true ?
            <ul className="pagination action-items">
              <li><a onClick={() => this.setState({shareModal: ""})}>Share</a></li>
              <li><a onClick={() => this.setState({tagDownload: true })}>Tag</a></li>
              <li><a onClick={this.download}>Download</a></li>
              <ul className="right">
                <li><a><i className="tiny shared-files-table-selector material-icons">people</i></a></li>
              </ul>
            </ul>
         :
            <ul className="pagination inactive action-items">
              <li><a>Share</a></li>
              <li><a>Tag</a></li>
              <li><a>Download</a></li>
              <ul className="right">
                <li><a><i className="tiny shared-files-table-selector material-icons">people</i></a></li>
              </ul>
            </ul>

        }
          <table className="bordered">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Shared With</th>
                <th>Uploaded</th>
                <th>Tags</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
          {
            currentFiles.slice(indexOfFirstFile, indexOfLastFile).map(file => {
              console.log(currentFiles);
              var tags;
              var collabs;
              if(file.tags) {
                tags = Array.prototype.slice.call(file.tags);
              } else {
                tags = "";
              }
              if(file.sharedWith) {
                collabs = Array.prototype.slice.call(file.sharedWith);
              } else {
                collabs = "";
              }
            return(
              <tr key={file.id}>
                <td><input type="checkbox" checked={this.state.checked} value={file.id} id={file.id} onChange={this.handleCheckbox} /><label htmlFor={file.id}></label></td>
                <td><Link to={'/vault/' + file.id}>{file.name.length > 20 ? file.name.substring(0,20)+"..." :  file.name}</Link></td>
                <td>{collabs === "" ? collabs : collabs.join(', ')}</td>
                <td>{file.uploaded}</td>
                <td>{tags === "" ? tags : tags.join(', ')}</td>
                <td>{file.type.split('/')[1]}</td>
                <td><Link to={'/vault/delete/'+ file.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></td>
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
            <label>Files per page</label>
            <select value={this.state.filesPerPage} onChange={(event) => this.setState({ filesPerPage: event.target.value})}>
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
                  {singleFileTags.slice(0).reverse().map(tag => {
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
          {/*files.slice(0).reverse().map(file => {
              return(

                <div key={file.id} className="col s12 m6 l3">

                  <div className="card collections-card hoverable horizontal">
                  <Link to={'/vault/' + file.id} className="side-card black-text file-side">
                    <div className="card-image card-image-side file-side">
                    {
                      file.type.includes("image") ? <img src="https://i.imgur.com/jLnXZXM.png" alt="icon" /> :
                      file.type.includes("pdf") ? <img src="https://i.imgur.com/urkNBL9.png" alt="icon" /> :
                      file.type.includes("word") ? <img className="icon-image" src="https://i.imgur.com/6ibKpk4.png" alt="word document" /> :
                      file.type.includes("rtf") || file.type.includes("text/plain") || file.type.includes("opendocument") ? <img className="icon-image" src="https://i.imgur.com/xADzUSW.png" alt="document" /> :
                      file.type.includes("video") ? <img className="icon-image" src="https://i.imgur.com/Hhj5KAl.png" alt="video icon" /> :
                      file.type.includes("spreadsheet") ? <img className="icon-image" src="https://i.imgur.com/1mOhZ4u.png" alt="excel file" /> :
                      file.type.includes("csv") ? <img className="icon-image" src="https://i.imgur.com/BxA1Cgv.png" alt="csv file" /> :
                      <div />
                    }
                    </div>
                    </Link>
                    <div className="card-stacked">
                    <Link to={'/vault/' + file.id} className="black-text">
                      <div className="card-content">
                        <p className="title">{file.name.length > 14 ? file.name.substring(0,17)+"..." :  file.name}</p>
                      </div>
                    </Link>
                      <div className="edit-card-action card-action">
                        <p><span className="muted muted-card">Uploaded: {file.uploaded}</span><Link to={'/vault/delete/' + file.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></p>
                      </div>
                    </div>

                  </div>
                </div>

              )
              })
            */}
        </div>
      </div>
      </div> : null
    );
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
    });
  }
}
