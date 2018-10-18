import React, { Component } from 'react';
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import {
  SUPPORTED_FORMULAS
} from '../helpers/formulas.js';
import { HotTable } from '@handsontable/react';
// import Handsontable from 'handsontable-pro';
import update from 'immutability-helper';
import {CSVLink} from 'react-csv';
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
      revealModule: "innerStealthy",
      decryption: true,
      selectedData: "",
      dataLocation: [],
      range: false,
      colRange: false,
      rangeParams: [],
      selectedRange: {},
      colWidths: 100
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
      onAfterChange: (changes, source) => {if(changes){
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.handleAddItem, 3000)
      }},
      onAfterSelection: (r, c, r2, c2, preventScrolling) => {
         preventScrolling.value = true;
         clearTimeout(this.timeout);
         this.timeout = setTimeout(() => this.captureCellData([r,c]), 500);
       },
       onAfterColumnResize: (currentColumn, newSize, isDoubleClick) => {
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
    window.$('.modal').modal();
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

captureCellData = (props) => {
  console.log(props);
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
  window.$('.modal').modal();
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
  const {  hideStealthy, loading, autoSave, shareModal, show, hideSheet, initialLoad, contacts, publicShare, remoteStorage } = this.state;
  const remoteStorageActivator = remoteStorage === true ? "" : "hide";
  const colorList = [ '000000', '993300', '333300', '003300', '003366', '000066', '333399', '333333',
'660000', 'FF6633', '666633', '336633', '336666', '0066FF', '666699', '666666', 'CC3333', 'FF9933', '99CC33', '669966', '66CCCC', '3366FF', '663366', '999999', 'CC66FF', 'FFCC33', 'FFFF66', '99FF66', '99CCCC', '66CCFF', '993366', 'CCCCCC', 'FF99CC', 'FFCC99', 'FFFF99', 'CCffCC', 'CCFFff', '99CCFF', 'CC99FF', 'FFFFFF' ];
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
              <li><a className="dropdown-button" data-activates="singleSheet"><i className="small-menu material-icons">more_vert</i></a></li>
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
              <ul id="singleSheet" className="dropdown-content single-doc-dropdown-content">
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
              <li><a className="dropdown-button" data-activates="singleSheet"><i className="small-menu material-icons">more_vert</i></a></li>
              {/*<li><a className="small-menu tooltipped stealthy-logo" data-position="bottom" data-delay="50" data-tooltip="Stealthy Chat" onClick={() => this.setState({hideStealthy: !hideStealthy})}><img className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/></a></li>*/}
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
              <ul id="singleSheet" className="dropdown-content single-doc-dropdown-content">
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
      {/*<nav className="sheets-bar">
        <div className="ql-toolbar ql-snow">
        <div className="row">
          <i className="col s1 material-icons right-align black-text">functions</i><input type="text" className="browser-default col s10 black-text" /><div className="col s1" />
        </div>
        </div>
      </nav>*/}

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
          <div className={hideSheet}>
          <nav className="spreadsheet-tools">
              <div className="nav-wrapper">
                <ul className="left">
                  <li><a><input type="text" onChange={this.handleInput} value={!isNaN(this.state.selectedData) ? this.state.selectedData : this.state.selectedData != null && this.state.selectedData.includes('<') ? this.state.selectedData.replace(/<(?:.|\n)*?>/gm, '') : this.state.selectedData === null ? "" : this.state.selectedData} placeholder="fx" /></a></li>
                  <li><a onClick={this.makeItBold}><i className="tiny material-icons">format_bold</i></a></li>
                  <li><a onClick={this.makeItItalic}><i className="tiny material-icons">format_italic</i></a></li>
                  <li><a className="dropdown-button" data-activates='colors-drop'><i className="tiny material-icons">format_color_text</i></a></li>
                  <li><a className="dropdown-button" data-activates='formulas-drop'><i className="tiny material-icons">functions</i></a></li>
                </ul>
              </div>
            </nav>
            <div id='formulas-drop' className='dropdown-content'>
              <div className="container">
              <h6 className="black-text">Most Used</h6>
              <ul>
                <li><a onClick={() => this.handleFormulaSet("SUM")}>SUM</a></li>
                <li><a onClick={() => this.handleFormulaSet("COUNT")}>COUNT</a></li>
                <li><a onClick={() => this.handleFormulaSet("AVERAGE")}>AVERAGE</a></li>
              </ul>
              <hr />
              <h6 className="black-text">All Formulas</h6>
              <ul>
              {
                SUPPORTED_FORMULAS.map(formula => {
                  return (
                    <li key={formula}><a onClick={() => this.handleFormulaSet(formula)}>{formula}</a></li>
                  )
                })
              }
              </ul>
              </div>
            </div>
            <div id='colors-drop' className='dropdown-content'>
              <div className="row center-align">
                {
                  colorList.map(c => {
                    let backgroundColor = '#' + c;
                    let bColor = {
                      background: backgroundColor
                    }

                    return(
                      <a onClick={() => this.handleColorSelect(c)} key={c} style={bColor} className="col s2 color-picker"><span className="hide">a</span></a>
                    )
                  })
                }
              </div>
            </div>
            <div className="spreadsheet-table">

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
          {/*stealthyModule*/}
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
