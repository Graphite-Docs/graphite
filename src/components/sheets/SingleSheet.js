import React, { Component } from 'react';
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import axios from 'axios';
import { Icon, Modal, Input, Button, Dropdown } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import {
  SUPPORTED_FORMULAS
} from '../helpers/formulas.js';
import { HotTable } from '@handsontable-pro/react';
import Loading from '../Loading';
import 'handsontable-pro/dist/handsontable.full.css';
// import Handsontable from 'handsontable-pro';
import update from 'immutability-helper';
// import {CSVLink} from 'react-csv';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
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
      sharedWith: [],
      index: "",
      save: "",
      saveNow: false,
      loading: false,
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
      revealModule: "innerStealthy",
      decryption: true,
      selectedData: "",
      dataLocation: [],
      range: false,
      colRange: false,
      rangeParams: [],
      selectedRange: {},
      colWidths: 100,
      modalOpen: false
    }

    //Handsontable
    this.id = 'hot';
    this.hotSettings = {
      data: this.state.grid,
      renderer: 'html',
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      colHeaders: true,
      rowHeaders: true,
      colWidths: this.state.colWidths,
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
      afterChange: (changes, source) => {if(changes){
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(this.handleAddItem, 3000)
      }},
      afterSelection: (r, c, r2, c2, preventScrolling) => {
         preventScrolling.value = true;
         clearTimeout(this.timeout);
         this.timeout = setTimeout(() => this.captureCellData([r,c]), 500);
       },
       afterColumnResize: (currentColumn, newSize, isDoubleClick) => {
         this.handleResizeColumn([currentColumn, newSize]);
         setTimeout(this.handleAddItem, 3000)
       }
    };
    this.hotTableComponent = React.createRef();

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
    this.loadSingle = this.loadSingle.bind(this);
    this.loadSingleForm = this.loadSingleForm.bind(this);
  }
  componentDidMount() {
    document.addEventListener("keydown", (event) => {
      let ctrl = event.which === 66 && event.ctrlKey;
      let cmd = event.metaKey && event.which === 66;
      let ctrli = event.which === 73 && event.ctrlKey;
      let cmdi = event.metaKey && event.which === 73;
      if(ctrl || cmd) {
        this.makeItBold();
      }
      if(ctrli || cmdi) {
        this.makeItItalic();
      }
    });

    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
       } else {
         console.log("No contacts");
       }
     })
      .catch(error => {
        console.log(error);
      });

      getFile(window.location.href.split('sheet/') + 'sharedwith.json', {decrypt: true})
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
     }).then(() =>{
       let sheets = this.state.sheets;
       const thisSheet = sheets.find((sheet) => { return sheet.id.toString() === window.location.href.split('/sheets/sheet/')[1]}); //this is comparing strings
       let index = thisSheet && thisSheet.id;
       function findObjectIndex(sheet) {
           return sheet.id === index; //this is comparing numbers
       }
       // let grid = thisSheet && thisSheet.content;
       this.setState({ sharedWith: thisSheet && thisSheet.sharedWith, index: sheets.findIndex(findObjectIndex) }, () => {
         if(thisSheet && thisSheet.form === true) {
           this.setState({ decryption: false }, () => {
             this.loadSingleForm();
           })
         } else {
           this.loadSingle();
         }
       })
       // console.log(this.state.title);
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
      // setTimeout(this.handleAddItem,1000);
  }

  loadSingleForm() {
    const thisFile = window.location.href.split('sheets/sheet/')[1];
    const fullFile = '/sheets/' + thisFile + '.json';
    getFile(fullFile, {decrypt: this.state.decryption})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ singleSheet: JSON.parse(fileContents), title: JSON.parse(fileContents || '{}').title, grid: JSON.parse(fileContents || '{}').content  })
       }
     })
     .then(() => {
       this.setState({ initialLoad: "hide" });
     })
      .catch(error => {
        console.log(error);
      });
  }

  loadSingle() {
    const thisFile = window.location.href.split('sheets/sheet/')[1];
    const fullFile = '/sheets/' + thisFile + '.json';
    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         if(JSON.parse(fileContents).colWidths) {
           this.setState({ title: JSON.parse(fileContents || '{}').title, grid: JSON.parse(fileContents || '{}').content, colWidths: JSON.parse(fileContents || '{}').colWidths })
         } else {
           this.setState({ title: JSON.parse(fileContents || '{}').title, grid: JSON.parse(fileContents || '{}').content, colWidths: 100 })
         }
       }
     })
     .then(() => {
       this.hotSettings.colWidths = this.state.colWidths;
       this.setState({ initialLoad: "hide" });
       this.hotTableComponent.current.hotInstance.loadData(this.state.grid);
     })
      .catch(error => {
        console.log(error);
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
      object.id = window.location.href.split('/sheets/sheet/')[1];
      object.updated = getMonthDayYear();
      object.sharedWith = this.state.sharedWith;
      object.fileType = "sheets";
      object.form = this.state.singleSheet.form;
      object.colWidths = this.state.colWidths;
      const objectTwo = {};
      objectTwo.title = object.title;
      objectTwo.id = object.id;
      objectTwo.updated = object.updated;
      objectTwo.sharedWith = object.sharedWith;
      objectTwo.fileType = "sheets";
      objectTwo.form = this.state.singleSheet.form;
      objectTwo.lastUpdate = Date.now();
      const index = this.state.index;
      const updatedSheet = update(this.state.sheets, {$splice: [[index, 1, objectTwo]]});  // array.splice(start, deleteCount, item1)
      this.setState({sheets: updatedSheet, singleSheet: object, autoSave: "Saving..." }, () => {
        this.autoSave();
      });
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
  if(this.state.singleSheet.form === true) {
    putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt: false})
      .then(() => {
        console.log("Autosaved");
        this.saveCollection();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  } else {
    putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt: true})
      .then(() => {
        console.log("Autosaved");
        this.saveCollection();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

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
      getFile('graphiteprofile.json', options)
        .then((fileContents) => {
          if(JSON.parse(fileContents).emailOK) {
            const object = {};
            object.sharedBy = loadUserData().username;
            object.from_email = "contact@graphitedocs.com";
            object.to_email = JSON.parse(fileContents).profileEmail;
            if(window.location.href.includes('/sheets')) {
              object.subject = 'New Graphite Sheet Shared by ' + loadUserData().username;
              object.link = window.location.origin + '/sheets/single/shared/' + loadUserData().username + '/' + window.location.href.split('sheet/')[1];
              object.content = "<div style='text-align:center;'><div style='background:#282828;width:100%;height:auto;margin-bottom:40px;'><h3 style='margin:15px;color:#fff;'>Graphite</h3></div><h3>" + loadUserData().username + " has shared a sheet with you.</h3><p>Access it here:</p><br><a href=" + object.link + ">" + object.link + "</a></div>"
              axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/file-shared', object)
                .then((res) => {
                  console.log(res);
                })
              console.log(object);
            }
          } else {

          }
        })
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
      object.id = window.location.href.split('sheet/')[1];
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

captureCellData = (props) => {
  let data;
  this.hotTableComponent.current.hotInstance.getDataAtCell(props[0], props[1]) == null ? data = "" : data = this.hotTableComponent.current.hotInstance.getDataAtCell(props[0], props[1]);
  this.setState({ dataLocation: props, selectedData: data}, () => {
    if(this.state.selectedData === null) {
      this.setState({ selectedData: "" });
    }
  })
  if(this.hotTableComponent.current.hotInstance.getSelectedRange()[0].to.row > this.hotTableComponent.current.hotInstance.getSelectedRange()[0].from.row) {
    this.setState({ selectedRange: this.hotTableComponent.current.hotInstance.getSelectedRange()[0] })
    this.setState({ range: true, rangeParams: [this.hotTableComponent.current.hotInstance.getSelectedRange()[0].from.row, this.hotTableComponent.current.hotInstance.getSelectedRange()[0].to.row, this.hotTableComponent.current.hotInstance.getSelectedRange()[0].from.col, this.hotTableComponent.current.hotInstance.getSelectedRange()[0].to.col] })
  }
  if(this.hotTableComponent.current.hotInstance.getSelectedRange()[0].to.col > this.hotTableComponent.current.hotInstance.getSelectedRange()[0].from.col) {
    this.setState({ selectedRange: this.hotTableComponent.current.hotInstance.getSelectedRange()[0] })
    this.setState({ colRange: true, range: true, rangeParams: [this.hotTableComponent.current.hotInstance.getSelectedRange()[0].from.row, this.hotTableComponent.current.hotInstance.getSelectedRange()[0].to.row, this.hotTableComponent.current.hotInstance.getSelectedRange()[0].from.col, this.hotTableComponent.current.hotInstance.getSelectedRange()[0].to.col] })
  } else {
    this.setState({ colRange: false });
  }
}

makeItBold = () => {
  var i;
  if(this.state.range && !this.state.colRange) {
    var b = this.state.selectedRange.to.row;
    var c = this.state.selectedRange.from.col;
    for (i=this.state.selectedRange.from.row; i < b +1; i++) {
      let data = this.hotTableComponent.current.hotInstance.getDataAtCell(i, c)
      if(data.includes('<strong>')) {
        this.hotTableComponent.current.hotInstance.setDataAtCell(i,c, data.split('<strong>')[1].split('</strong>')[0]);
      } else {
        this.hotTableComponent.current.hotInstance.setDataAtCell(i,c, '<strong>'+ data +'</strong>');
      }
    }
  } else if(this.state.range && this.state.colRange) {
    var e = this.state.selectedRange.to.row;
    var v;
    var d = this.state.selectedRange.to.col;
    for (v=this.state.selectedRange.from.col; v < d + 1; v++) {
      for (i=this.state.selectedRange.from.row; i < e +1; i++) {
        let data = this.hotTableComponent.current.hotInstance.getDataAtCell(i, v)
        if(data.includes('<strong>')) {
          this.hotTableComponent.current.hotInstance.setDataAtCell(i,v, data.split('<strong>')[1].split('</strong>')[0]);
        } else {
          this.hotTableComponent.current.hotInstance.setDataAtCell(i,v, '<strong>'+ data +'</strong>');
        }
      }
    }
  } else {
    if(this.state.selectedData.includes('<strong>')) {
      this.hotTableComponent.current.hotInstance.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], this.state.selectedData.split('<strong>')[1].split('</strong>')[0]);
    } else {
      this.hotTableComponent.current.hotInstance.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], '<strong>'+ this.state.selectedData +'</strong>');
    }
  }

}

makeItItalic = () => {
  var i;
  if(this.state.range && !this.state.colRange) {
    var b = this.state.selectedRange.to.row;
    var c = this.state.selectedRange.from.col;
    for (i=this.state.selectedRange.from.row; i < b +1; i++) {
      let data = this.hotTableComponent.current.hotInstance.getDataAtCell(i, c)
      if(data.includes('<em>')) {
        this.hotTableComponent.current.hotInstance.setDataAtCell(i,c, data.split('<em>')[1].split('</em>')[0]);
      } else {
        this.hotTableComponent.current.hotInstance.setDataAtCell(i,c, '<em>'+ data +'</em>');
      }
    }

  } else if(this.state.range && this.state.colRange) {
    var v;
    var e = this.state.selectedRange.to.row;
    var d = this.state.selectedRange.to.col;
    for (v=this.state.selectedRange.from.col; v < d + 1; v++) {
      for (i=this.state.selectedRange.from.row; i < e +1; i++) {
        let data = this.hotTableComponent.current.hotInstance.getDataAtCell(i, v)
        if(data.includes('<em>')) {
          this.hotTableComponent.current.hotInstance.setDataAtCell(i,v, data.split('<em>')[1].split('</em>')[0]);
        } else {
          this.hotTableComponent.current.hotInstance.setDataAtCell(i,v, '<em>'+ data +'</em>');
        }
      }
    }
  } else {
    if(this.state.selectedData.includes('<em>')) {
      this.hotTableComponent.current.hotInstance.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], this.state.selectedData.split('<em>')[1].split('</em>')[0]);
    } else {
      this.hotTableComponent.current.hotInstance.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], '<em>'+ this.state.selectedData +'</em>');
    }
  }
}

handleInput = (e) => {
  this.setState({ selectedData: e.target.value }, () => {
    this.hotTableComponent.current.hotInstance.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], this.state.selectedData);
  });

  let data = this.state.dataLocation;
  let oldData = data;
  this.setState({ selectedData: e.target.value })
  if(window.event.which === 13 || window.event.which === 9 || oldData !== data ) {
    this.setState({ selectedData: "" })
  }
}

handleResizeColumn = (props) => {
  if(this.hotSettings.colWidths === 100) {
    var i;
    var b = this.hotTableComponent.current.hotInstance.countCols();
    let cols = [];
    for (i = 0; i < b; i++) {
      cols = [...cols, 100];
    }
    cols[props[0]] = props[1];
    this.setState({ colWidths: cols });
  } else {
    let cols = this.state.colWidths;
    cols[props[0]] = props[1];
    this.setState({ colWidths: cols });
  }
}

handleColorSelect = (props) => {
  let color = '#' + props;
  var i;
  if(this.state.range && !this.state.colRange) {
    var b = this.state.selectedRange.to.row;
    var c = this.state.selectedRange.from.col;
    for (i=this.state.selectedRange.from.row; i < b +1; i++) {
      let data = this.hotTableComponent.current.hotInstance.getDataAtCell(i, c)
      // this.hotTableComponent.current.hotInstance.setDataAtCell(i,c, '<span style="color:' + color + ';"' + '>'+ data +'</span>');
      if(data.includes('<span')) {
        this.hotTableComponent.current.hotInstance.setDataAtCell(i,c, '<span style="color:' + color + ';">'+ data.split(';">')[1].split('</span>')[0]+'</span>');
      } else {
        this.hotTableComponent.current.hotInstance.setDataAtCell(i,c, '<span style="color:' + color + ';">'+ data +'</span>');
      }
    }

  } else if(this.state.range && this.state.colRange) {
    var v;
    var d = this.state.selectedRange.to.col;
    for (v=this.state.selectedRange.from.col; v < d + 1; v++) {
      for (i=this.state.selectedRange.from.row; i < b +1; i++) {
        let data = this.hotTableComponent.current.hotInstance.getDataAtCell(i, v)
        if(data.includes('<span')) {
          this.hotTableComponent.current.hotInstance.setDataAtCell(i,v, '<span style="color:' + color + ';">'+ data.split(';">')[1].split('</span>')[0]+'</span>');
        } else {
          this.hotTableComponent.current.hotInstance.setDataAtCell(i,v, '<span style="color:' + color + ';">'+ data +'</span>');
        }
      }
    }
  } else {
    if(this.state.selectedData.includes('<span')) {
      this.hotTableComponent.current.hotInstance.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], '<span style="color:' + color + ';">'+ this.state.selectedData.split(';">')[1].split('</span>')[0]+'</span>');
    } else {
      this.hotTableComponent.current.hotInstance.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], '<span style="color:' + color + ';">'+ this.state.selectedData +'</span>');
    }
  }
}

handleFormulaSet = (props) => {
  this.hotTableComponent.current.hotInstance.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], '=' + props + '()');
  this.hotTableComponent.current.hotInstance.selectCell(this.state.dataLocation[0],this.state.dataLocation[1]);
}

renderView() {
  const {  loading, autoSave, shareModal, show, contacts, publicShare, title } = this.state;

  const colorList = [ '000000', '993300', '333300', '003300', '003366', '000066', '333399', '333333',
'660000', 'FF6633', '666633', '336633', '336666', '0066FF', '666699', '666666', 'CC3333', 'FF9933', '99CC33', '669966', '66CCCC', '3366FF', '663366', '999999', 'CC66FF', 'FFCC33', 'FFFF66', '99FF66', '99CCCC', '66CCFF', '993366', 'CCCCCC', 'FF99CC', 'FFCC99', 'FFFF99', 'CCffCC', 'CCFFff', '99CCFF', 'CC99FF', 'FFFFFF' ];
  if(loading) {
    return (
      <Loading />
    );
  } else {
    return (
      <div>
      <div className="center-align sheets-loader">
      <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
        <MainMenu.Item onClick={this.handleBack}>
          <Icon name='arrow left' />
        </MainMenu.Item>
        <MainMenu.Item>
        {
          title
          ?
          (title.length > 15 ? title.substring(0,15)+"..." : title)
          :
          "Title here..."
        }
        <Modal
          trigger={<a style={{ cursor: "pointer", color: "#fff"}}  onClick={() => this.setState({ modalOpen: true})}><Icon style={{marginLeft: "10px"}} name='edit outline' /></a> }
          closeIcon
          open={this.state.modalOpen}
          closeOnEscape={true}
          closeOnDimmerClick={true}
          onClose={() => this.setState({ modalOpen: false})}
          >
          <Modal.Header>Edit Sheet Title</Modal.Header>
          <Modal.Content>
            <Modal.Description>

              {
                title === "Untitled" ?
                <div>
                Title <br/>
                <Input
                  placeholder="Give it a title"
                  type="text"
                  value=""
                  onChange={this.handleTitleChange}
                />
                </div>
                :
                <div>
                Title<br/>
                <Input
                  placeholder="Title"
                  type="text"
                  value={title}
                  onChange={this.handleTitleChange}
                />
                <Button onClick={() => this.setState({ modalOpen: false })} style={{ borderRadius: "0"}} secondary>Save</Button>
                </div>
              }
            </Modal.Description>
          </Modal.Content>
        </Modal>
        </MainMenu.Item>
        <MainMenu.Item>
          {autoSave}
        </MainMenu.Item>
        </MainMenu>
        <div>
        <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#282828", color: "#fff", top: "37px" }}>
          <MainMenu.Item>
            <Input onChange={this.handleInput} value={!isNaN(this.state.selectedData) ? this.state.selectedData : this.state.selectedData != null && this.state.selectedData.includes('<') ? this.state.selectedData.replace(/<(?:.|\n)*?>/gm, '') : this.state.selectedData === null ? "" : this.state.selectedData} placeholder="fx" />
          </MainMenu.Item>
          <MainMenu.Item>
            <a style={{color: "#fff"}} onClick={this.makeItBold}><Icon name='bold' /></a>
          </MainMenu.Item>
          <MainMenu.Item>
            <a style={{color: "#fff"}} onClick={this.makeItItalic}><Icon name='italic' /></a>
          </MainMenu.Item>
          <MainMenu.Item>
            <Dropdown icon='eye dropper'>
              <Dropdown.Menu>
              <Dropdown.Menu scrolling>
                {
                  colorList.map(c => {

                    return(
                      <Dropdown.Item key={c}><a style={{background: "#" + c.toString(), padding: "5px"}} onClick={() => this.handleColorSelect(c)}>{c}</a></Dropdown.Item>
                    )
                  })
                }
              </Dropdown.Menu>
              </Dropdown.Menu>
              </Dropdown>
          </MainMenu.Item>
          <MainMenu.Item>
            <Dropdown text='Formulas'>
              <Dropdown.Menu>
              <Dropdown.Menu scrolling>
              {
                SUPPORTED_FORMULAS.map(formula => {
                  return (
                    <Dropdown.Item key={formula}><a onClick={() => this.handleFormulaSet(formula)}>{formula}</a></Dropdown.Item>
                  )
                })
              }
              </Dropdown.Menu>
              </Dropdown.Menu>
              </Dropdown>
          </MainMenu.Item>
          </MainMenu>
        </div>
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
        </div>
        </div>
        <div>

              {
                this.state.decryption !==true ?
                <HotTable id='table' root="hot" settings={{
                  data: this.state.grid,
                  renderer: 'html',
                  stretchH: 'all',
                  manualRowResize: true,
                  manualColumnResize: true,
                  colHeaders: true,
                  rowHeaders: true,
                  colWidths: 100,
                  rowHeights: 30,
                  minCols: 26,
                  minRows: 1,
                  contextMenu: true,
                  formulas: true,
                  columnSorting: true,
                  autoRowSize: true,
                  manualColumnMove: true,
                  manualRowMove: true,
                  ref: "hot",
                  fixedRowsTop: 0,
                  minSpareRows: 0,
                  comments: true,
                  licenseKey: '6061a-b3be5-94c65-64d27-a1d41',
                  onAfterChange: (changes, source) => {if(changes){
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(this.handleAddItem, 3000)
                  }},

                }}
                 /> :
                 <HotTable data={this.state.grid} ref={this.hotTableComponent} id={this.id} settings={this.hotSettings} />
              }
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
