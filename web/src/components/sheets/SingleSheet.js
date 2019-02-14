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
import {Bar} from 'react-chartjs-2';
import {Line} from 'react-chartjs-2';
import {Doughnut} from 'react-chartjs-2';
import Loading from '../shared/Loading';
import 'handsontable-pro/dist/handsontable.full.css';
// import Handsontable from 'handsontable-pro';
import update from 'immutability-helper';
import { CompactPicker } from 'react-color';
// import {CSVLink} from 'react-csv';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
import Handsontable from 'handsontable-pro';
const { encryptECIES } = require('blockstack/lib/encryption');
const randomColor = require('randomcolor');
let colorPicker = 'hide';
let colorPickerHighlight = 'hide';
let filteredMetas;

let hot;
let selectedData;
let labels;
let values;
let background;
let border;
let hoverBackground;
let hoverBorder;
let top;
let left;

var color = randomColor({
  count: 4
});
background = color[0];
border = color[1];
hoverBackground = color[2];
hoverBorder = color[3];

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
      modalOpen: false,
      display: false,
      cellsMeta: [],
      sidebar: false,
      chartType: "bar",
      chartLocation: "",
      chartHTML: "",
      inputModal: false,
      chartModal: false,
      chartColor: false,
      chartData: {},
      displayChart: false,
      displayHighlight: false
    }

    //Handsontable
    this.id = 'hot';
    // this.hotSettings = {
    //   data: this.state.grid,
    //   renderer: 'html',
    //   stretchH: 'all',
    //   manualRowResize: true,
    //   manualColumnResize: true,
    //   colHeaders: true,
    //   rowHeaders: true,
    //   colWidths: this.state.colWidths,
    //   rowHeights: 30,
    //   minCols: 26,
    //   minRows: 100,
    //   contextMenu: true,
    //   formulas: true,
    //   columnSorting: true,
    //   autoRowSize: true,
    //   manualColumnMove: true,
    //   manualRowMove: true,
    //   outsideClickDeselects: false,
    //   ref: "hot",
    //   fixedRowsTop: 0,
    //   minSpareRows: 1,
    //   comments: true,
    //   selectionMode: 'multiple',
    //   licenseKey: '6061a-b3be5-94c65-64d27-a1d41',
    //   afterChange: (changes, source) => {if(changes){
    //     console.log("change")
    //     clearTimeout(this.changeTimeout);
    //     this.changeTimeout = setTimeout(this.handleAddItem, 3000)
    //   }},
    //   afterSelection: (r, c, r2, c2, preventScrolling) => {
    //     console.log("selection")
    //      preventScrolling.value = true;
    //      clearTimeout(this.timeout);
    //      this.timeout = setTimeout(() => this.captureCellData([r,c]), 500);
    //    },
    //    afterColumnResize: (currentColumn, newSize, isDoubleClick) => {
    //      console.log("column resize")
    //      this.handleResizeColumn([currentColumn, newSize]);
    //      setTimeout(this.handleAddItem, 3000)
    //    }
    // };
    // this.hotTableComponent = React.createRef();

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
    this.setState({ loading: true })

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
           top = JSON.parse(fileContents).chartTop || 0;
           left = JSON.parse(fileContents).chartLeft || 0;
           this.setState({
             title: JSON.parse(fileContents || '{}').title,
             grid: JSON.parse(fileContents || '{}').content,
             colWidths: JSON.parse(fileContents || '{}').colWidths,
             cellsMeta: JSON.parse(fileContents).cellsMeta,
             // displayChart: JSON.parse(fileContents).displayChart,
             // chartData: JSON.parse(fileContents).chartData,
             // chartType: JSON.parse(fileContents).chartType || 'bar'
           })
         } else {
           top = JSON.parse(fileContents).chartTop || 0;
           left = JSON.parse(fileContents).chartLeft || 0;
           this.setState({
             title: JSON.parse(fileContents || '{}').title,
             grid: JSON.parse(fileContents || '{}').content,
             colWidths: 100,
             cellsMeta: JSON.parse(fileContents).cellsMeta,
             // displayChart: JSON.parse(fileContents).displayChart,
             // chartData: JSON.parse(fileContents).chartData,
             // chartType: JSON.parse(fileContents).chartType || 'bar'
            })
         }
       }
     })
     .then(() => {
       this.setState({ loading: false });
       var container = document.getElementById('sheet');
       hot = new Handsontable(container, {
         data: this.state.grid,
         filters: true,
         dropdownMenu: true,
         licenseKey: '6061a-b3be5-94c65-64d27-a1d41',
         manualRowResize: true,
         manualColumnResize: true,
         colHeaders: true,
         rowHeaders: true,
         rowHeights: 30,
         minCols: 26,
         minRows: 100,
         contextMenu: true,
         formulas: true,
         columnSorting: true,
         autoRowSize: true,
         manualColumnMove: true,
         manualRowMove: true,
         outsideClickDeselects: false,
         ref: "hot",
         fixedRowsTop: 0,
         minSpareRows: 1,
         comments: true,
         selectionMode: 'multiple',
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
       });
     })
     .then(() => {

       if(this.state.cellsMeta) {
         let meta = this.state.cellsMeta;
         for (var i = 0; i < meta.length; i++) {
           for (var key in meta[i]) {
             if (key === 'row' || key === 'col') {
               continue;
             }

             if (meta[i].hasOwnProperty(key)) {
               hot.setCellMeta(meta[i].row, meta[i].col, key, meta[i][key])
             }
           }
         }

         hot.render();
       }

      })
       .then(() => {
         this.setState({ loading: false });
       })
       .then(() => {
         this.loadContacts();
       })
      .catch(error => {
        console.log(error);
      });
  }

  loadContacts = () => {
    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
       } else {
         console.log("No contacts");
       }
     })
      .then(() => {

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


filterMetas = (cellsMeta) => {
  // Standard cell meta properties are row, col, prop, visualCol, visualRow and instance
  var standardMetas = ['prop', 'visualCol', 'visualRow', 'instance'];
  filteredMetas = [];
  if(cellsMeta) {

    for (var i = 0; i < cellsMeta.length; i++) {
      if(Object.keys(cellsMeta[i])) {
        if (Object.keys(cellsMeta[i]).length > 6) {
          for (var j = 0; j < standardMetas.length; j++) {
            if (cellsMeta[i][standardMetas[j]] !== void 0) {
              delete cellsMeta[i][standardMetas[j]];
            }
          }
          filteredMetas.push(cellsMeta[i]);
        }
      }
    }
  }
}

    handleAddItem() {

      let cellsMeta = hot.getCellsMeta();
      if(cellsMeta) {
        this.filterMetas(cellsMeta);
      }
      const object = {};
      object.title = this.state.title;
      object.content = this.state.grid;
      object.id = window.location.href.split('/sheets/sheet/')[1];
      object.updated = getMonthDayYear();
      object.sharedWith = this.state.sharedWith;
      object.fileType = "sheets";
      object.form = this.state.singleSheet.form;
      object.colWidths = this.state.colWidths;
      // object.displayChart = this.state.displayChart;
      // object.chartData = [].concat(this.state.chartData);
      // object.chartType = this.state.chartType;
      // object.chartTop = top;
      // object.chartLeft = left;
      object.cellsMeta = filteredMetas;
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
  const user = loadUserData().username;
  const userShort = user.slice(0, -3);
  const params = this.props.match.params.id;
  const directory = 'public/';
  const file = directory + userShort + params + '.json'
  putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
    .then(() => {

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
        this.setState({ shareModal: "hide", loading: false, show: "", hideSheet: "" });
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
      this.setState({ loading: true, show: "hide" });
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
      this.setState({ shareModal: "hide", loading: false, show: "", hideSheet: "" });
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
  const selection = hot.getSelected();
  selectedData = [];
  for (var i = 0; i < selection.length; i += 1) {
    var item = selection[i];

    selectedData.push(hot.getData.apply(hot, item));
  }

  hot.getDataAtCell(props[0], props[1]) == null ? data = "" : data = hot.getDataAtCell(props[0], props[1]);
  this.setState({ dataLocation: props, selectedData: data}, () => {
    if(this.state.selectedData === null) {
      this.setState({ selectedData: "" });
    }
  })
  if(hot.getSelectedRange()[0].to.row > hot.getSelectedRange()[0].from.row) {
    this.setState({ selectedRange: hot.getSelectedRange()[0] })
    this.setState({ range: true, rangeParams: [hot.getSelectedRange()[0].from.row, hot.getSelectedRange()[0].to.row, hot.getSelectedRange()[0].from.col, hot.getSelectedRange()[0].to.col] })
  }
  if(hot.getSelectedRange()[0].to.col > hot.getSelectedRange()[0].from.col) {
    this.setState({ selectedRange: hot.getSelectedRange()[0] })
    this.setState({ colRange: true, range: true, rangeParams: [hot.getSelectedRange()[0].from.row, hot.getSelectedRange()[0].to.row, hot.getSelectedRange()[0].from.col, hot.getSelectedRange()[0].to.col] })
  } else {
    this.setState({ colRange: false });
  }
}

makeItBold = () => {
  // const hot3 = hot;
  var selected = hot.getSelected();

  for (var index = 0; index < selected.length; index += 1) {
    var item = selected[index];
    var startRow = Math.min(item[0], item[2]);
    var endRow = Math.max(item[0], item[2]);
    var startCol = Math.min(item[1], item[3]);
    var endCol = Math.max(item[1], item[3]);

    for (var rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
      for (var columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
        let styles;

        if(hot.getCellMeta(rowIndex, columnIndex).className) {
          styles = hot.getCellMeta(rowIndex, columnIndex).className + ' bold';
          hot.setCellMeta(rowIndex, columnIndex, 'className', styles);
        } else {
          styles = 'bold';
          hot.setCellMeta(rowIndex, columnIndex, 'className', styles);
        }

      }
    }
  }
  hot.render()
}

makeItItalic = () => {
  const hot3 = hot;
  var selected = hot3.getSelected();

  for (var index = 0; index < selected.length; index += 1) {
    var item = selected[index];
    var startRow = Math.min(item[0], item[2]);
    var endRow = Math.max(item[0], item[2]);
    var startCol = Math.min(item[1], item[3]);
    var endCol = Math.max(item[1], item[3]);

    for (var rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
      for (var columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
        let styles;

        if(hot3.getCellMeta(rowIndex, columnIndex).className) {
          styles = hot3.getCellMeta(rowIndex, columnIndex).className + ' italic';
          hot3.setCellMeta(rowIndex, columnIndex, 'className', styles);
        } else {
          styles = 'italic';
          hot3.setCellMeta(rowIndex, columnIndex, 'className', styles);
        }

      }
    }
  }
  hot3.render()
}

handleInput = (e) => {
  this.setState({ selectedData: e.target.value }, () => {
    hot.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], this.state.selectedData);
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
    var b = hot.countCols();
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
  const hot3 = hot;
  let color = 'color_' + props.hex.split('#')[1];
  var selected = hot3.getSelected();

  for (var index = 0; index < selected.length; index += 1) {
    var item = selected[index];
    var startRow = Math.min(item[0], item[2]);
    var endRow = Math.max(item[0], item[2]);
    var startCol = Math.min(item[1], item[3]);
    var endCol = Math.max(item[1], item[3]);
    var style = color;

    for (var rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
      for (var columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
        let styles;
        if(hot3.getCellMeta(rowIndex, columnIndex).className) {
          styles = hot3.getCellMeta(rowIndex, columnIndex).className + ' ' + style;
          hot3.setCellMeta(rowIndex, columnIndex, 'className', styles);
        } else {
          styles = 'bold';
          hot3.setCellMeta(rowIndex, columnIndex, 'className', style);
        }
      }
    }
  }
  hot3.render()
}

handleColorSelectHighlight = (props) => {
  const hot3 = hot;
  let color = 'background_' + props.hex.split('#')[1];
  var selected = hot3.getSelected();

  for (var index = 0; index < selected.length; index += 1) {
    var item = selected[index];
    var startRow = Math.min(item[0], item[2]);
    var endRow = Math.max(item[0], item[2]);
    var startCol = Math.min(item[1], item[3]);
    var endCol = Math.max(item[1], item[3]);
    var style = color;

    for (var rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
      for (var columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
        let styles;
        if(hot3.getCellMeta(rowIndex, columnIndex).className) {
          styles = hot3.getCellMeta(rowIndex, columnIndex).className + ' ' + style;
          hot3.setCellMeta(rowIndex, columnIndex, 'className', styles);
        } else {
          styles = 'bold';
          hot3.setCellMeta(rowIndex, columnIndex, 'className', style);
        }
      }
    }
  }
  hot3.render()
}

handleFormulaSet = (props) => {
  hot.setDataAtCell(this.state.dataLocation[0],this.state.dataLocation[1], '=' + props + '()');
  hot.selectCell(this.state.dataLocation[0],this.state.dataLocation[1]);
}

onColorClick = () => {
  this.setState({ display: !this.state.display})
}

handleChangeComplete = (color) => {
  this.setState({ color: color.hex, display: false }, () => {

    this.handleColorSelect(color);
  });
};

handleHighlightChangeComplete = (color) => {
  this.setState({ color: color.hex, displayHighlight: false }, () => {

    this.handleColorSelectHighlight(color);
  });
};

handleHideClick = () => this.setState({ sidebar: false })
handleShowClick = () => this.setState({ sidebar: true })
handleSidebarHide = () => this.setState({ sidebar: false })

handleChartInput = (e) => {
  this.setState({ chartLocation: e.target.value });
}

insertChart = (data) => {
  this.setState({ inputModal: false, chartModal: false, chartData: data, displayChart: true });
}

handleChartColorChange = () => {
  var color = randomColor({
    count: 4
  });
  background = color[0];
  border = color[1];
  hoverBackground = color[2];
  hoverBorder = color[3];
}

renderView() {
  if(document.getElementById("movableChart")) {
    dragElement(document.getElementById("movableChart"));

    function dragElement(elmnt) {
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
      } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
      }

      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        top = (elmnt.offsetTop - pos2) + "px";
        left = (elmnt.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  }



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


  if(this.state.display) {
    colorPicker = 'colorPickerSheets'
  } else {
    colorPicker = 'hide'
  }

  if(this.state.displayHighlight) {
    colorPickerHighlight = 'colorPickerSheets'
  } else {
    colorPickerHighlight = 'hide'
  }


  //This takes the array of selected data and converts it for use in a chart
  let merged;
  if(selectedData) {
    merged = [].concat.apply([], selectedData[0]);
    for(var i=0; i<merged.length;i++) merged[i] = parseInt(merged[i], 10);
    console.log(merged)

    labels = merged.filter((element, index) => {
      return index % 2 === 0;
    })

    values = merged.filter((element, index) => {
      return index % 2 !== 0;
    })

    for(var z=0; i<values.length;z++) values[z] = parseInt(values[z], 10);
    console.log(labels)
    console.log(values)
  }

  ///
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Data',
        backgroundColor: background,
        borderColor: border,
        borderWidth: 1,
        hoverBackgroundColor: hoverBackground,
        hoverBorderColor: hoverBorder,
        data: values
      }
    ]
  };

  const {  loading, autoSave, shareModal, show, contacts, publicShare, title } = this.state;

  if(loading) {
    return (
      <Loading />
    );
  } else {
    return (
      <div>
      <div className="center-align sheets-loader">
      <MainMenu className='sheetsMenu' style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
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
            <a style={{color: "#fff", cursor: "pointer"}} onClick={this.makeItBold}><Icon name='bold' /></a>
          </MainMenu.Item>
          <MainMenu.Item>
            <a style={{color: "#fff", cursor: "pointer"}} onClick={this.makeItItalic}><Icon name='italic' /></a>
          </MainMenu.Item>
          <MainMenu.Item>
            <a style={{color: "#fff", cursor: "pointer"}} onClick={() => this.setState({display: !this.state.display})}><Icon name='eye dropper' /></a>
          </MainMenu.Item>
          <MainMenu.Item>
            <a style={{color: "#fff", cursor: "pointer"}} onClick={() => this.setState({displayHighlight: !this.state.displayHighlight})}><Icon name='tint' /></a>
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
          <MainMenu.Item>
            <Modal
              trigger={<Icon onClick={() => this.setState({chartModal: true})} name='chart pie' style={{ cursor: "pointer", color: "#fff"}} /> }
              closeIcon
              closeOnEscape={true}
              closeOnDimmerClick={true}
              open={this.state.chartModal}
              onClose={() => this.setState({ chartModal: false })}
              >
              <Modal.Header>Add Chart</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <p>Create a chart with your selected data</p>
                  <Button onClick={() => this.setState({ chartType: "bar"})}>Bar</Button><Button onClick={() => this.setState({ chartType: "donut"})}>Donut</Button><Button onClick={() => this.setState({ chartType: "line"})}>Line</Button>

                  <div id='chart'>
                    {
                      this.state.chartType === "bar" ?
                      <Bar
                        data={chartData}
                        width={100}
                        height={50}

                      /> :
                      this.state.chartType === "donut" ?
                      <Doughnut data={chartData} /> :
                      this.state.chartType === "line" ?
                      <Line data={chartData} /> :
                      <p>Please select two columns of data, one with labels and one with numeric values</p>
                    }
                  </div>
                  <p>Charts are rendered ad hoc for now, but in a future release you will be able to add them to your sheet.</p>
                  {/*<Button style={{marginTop: "20px"}} secondary onClick={() => this.insertChart(chartData)}>Insert Chart</Button>*/}
                </Modal.Description>
              </Modal.Content>
            </Modal>
          </MainMenu.Item>
          </MainMenu>

          <div className={colorPicker}>
            <CompactPicker
              style={{zIndex: "999"}}
              color={ this.state.color }
              onChangeComplete={this.handleChangeComplete}
            />
          </div>

          <div className={colorPickerHighlight}>
            <CompactPicker
              style={{zIndex: "999"}}
              color={ this.state.color }
              onChangeComplete={this.handleHighlightChangeComplete}
            />
          </div>
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
            <div style={{top: top, left: left}} id='movableChart'>
              { this.state.displayChart ?
                this.state.chartType === 'bar' ?
                <Bar data={this.state.chartData} /> : this.state.chartType === 'donut' ?
                <Doughnut data={this.state.chartData} /> :
                <Line data={this.state.chartData} /> :
                <div className='hide' />
              }
            </div>


          <div id='sheet' className='spreadsheet'></div>
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
