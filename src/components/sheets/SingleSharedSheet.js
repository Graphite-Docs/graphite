import React, { Component } from "react";
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import HotTable from 'react-handsontable';
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SingleSharedSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sheets: [],
      sharedFile: [],
      grid: [[]],
      title : "",
      user: "",
      content:"",
      updated: "",
      words: "",
      index: "",
      save: "",
      loading: "hide",
      printPreview: false,
      autoSave: "Saved",
      receiverID: "",
      shareModal: "hide",
      hideButton: "",
      shareFile: [],
      show: "",
      img: avatarFallbackImage
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
  }

  componentDidMount() {
    getFile("spread.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
         this.setState({ user: JSON.parse(fileContents || '{}').user });
         this.refresh = setInterval(() => this.getOther(), 1000);
       } else {
         console.log("No sheets");
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
    }

getOther() {
  let fileID = loadUserData().username;
  let fileString = 'sharedsheets.json'
  let file = fileID.slice(0, -3) + fileString;
  const directory = '/shared/' + file;
  const options = { username: this.state.user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  getFile(directory, options)
  .then((fileContents) => {
   let privateKey = loadUserData().appPrivateKey;
    this.setState({ shareFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
    console.log("loaded");
    let allSheets = this.state.shareFile;
    // let sheets = allSheets.shareFile;
    const thisSheet = allSheets.find((sheet) => { return sheet.id.toString() === this.props.match.params.id}); //this is comparing strings
    let index = thisSheet && thisSheet.id;
    console.log(index);
    function findObjectIndex(sheet) {
        return sheet.id === index; //this is comparing numbers
    }
    this.setState({ grid: thisSheet && thisSheet.content, title: thisSheet && thisSheet.title, index: allSheets.findIndex(findObjectIndex) })
  })
  .catch(error => {
    console.log(error);
  });
}

  handleTitleChange(e) {
    this.setState({
      title: e.target.value
    });
  }
  handleChange(value) {
      this.setState({ content: value })
    }

  handleIDChange(e) {
      this.setState({ receiverID: e.target.value })
    }

    handleaddItem() {
      this.setState({ show: "hide" });
      this.setState({ hideButton: "hide", loading: "" })
      const rando = Date.now();
      const object = {};
      object.title = this.state.title;
      object.content = this.state.grid;
      object.id = rando;
      object.created = getMonthDayYear();

      this.setState({ sheets: [...this.state.sheets, object] });
      this.setState({ tempDocId: object.id });
      this.setState({ loading: "" });
      // this.setState({ confirm: true, cancel: false });
      setTimeout(this.saveNewFile, 500);
      // setTimeout(this.handleGo, 700);
    }

    saveNewFile() {
      putFile("spread.json", JSON.stringify(this.state), {encrypt: true})
        .then(() => {
          console.log("Saved!");
          window.location.replace("/sheets");
        })
        .catch(e => {
          console.log("e");
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

    return(
    <div>
    <div className="navbar-fixed toolbar">
      <nav className="toolbar-nav">
        <div className="nav-wrapper">
          <a href="/shared-sheets" className="left brand-logo"><i className="material-icons">arrow_back</i></a>
          <ul className="left toolbar-menu">

            <li><a onClick={this.handleaddItem}>Add to Sheets</a></li>
          </ul>
        </div>
      </nav>
    </div>
    <div className="">

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
          formulas: true,
          columnSorting: true,
          contextMenu: true,
          autoRowSize: true,
          manualColumnMove: true,
          manualRowMove: true,
          ref: "hot",
          fixedRowsTop: 0,
          minSpareRows: 1
          }}
         />
         </div>

        </div>
        </div>
      );
  }

  render() {

    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
