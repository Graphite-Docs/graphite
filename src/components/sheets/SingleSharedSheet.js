import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Profile from "../Profile";
import Signin from "../Signin";
import Header from "../Header";
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack';
import HotTable from 'react-handsontable';
import update from 'immutability-helper';
import {CSVLink, CSVDownload} from 'react-csv';
const formula = require('excel-formula');
const wordcount = require("wordcount");
const blockstack = require("blockstack");
const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
const Quill = ReactQuill.Quill;
const Font = ReactQuill.Quill.import('formats/font');
Font.whitelist = ['Ubuntu', 'Raleway', 'Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
ReactQuill.Quill.register(Font, true);

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

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
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
        if(this.state.printPreview == true) {
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
  const options = { username: this.state.user, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}
  getFile(directory, options)
  .then((fileContents) => {
   let privateKey = loadUserData().appPrivateKey;
    this.setState({ shareFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
    console.log("loaded");
    let allSheets = this.state.shareFile;
    // let sheets = allSheets.shareFile;
    const thisSheet = allSheets.find((sheet) => { return sheet.id == this.props.match.params.id});
    let index = thisSheet && thisSheet.id;
    console.log(index);
    function findObjectIndex(sheet) {
        return sheet.id == index;
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
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const rando = Date.now();
      const object = {};
      object.title = this.state.title;
      object.content = this.state.grid;
      object.id = rando;
      object.created = month + "/" + day + "/" + year;

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
    history.replaceState(history.state, '', '/');
    window.print();
    history.replaceState(history.state, '', curURL);
  }

  renderView() {
    let allSheets = this.state.shareFile;
    const loading = this.state.loading;
    const save = this.state.save;
    const autoSave = this.state.autoSave;
    const shareModal = this.state.shareModal;
    const hideButton = this.state.hideButton;
    const show = this.state.show;


    return(
    <div>
    <div className="navbar-fixed toolbar">
      <nav className="toolbar-nav">
        <div className="nav-wrapper">
          <a href="/shared-sheets" className="brand-logo"><i className="material-icons">arrow_back</i></a>
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
          contextMenu: true,
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

// <div className={loading}>
//   <div className="preloader-wrapper small active">
//       <div className="spinner-layer spinner-green-only">
//         <div className="circle-clipper left">
//           <div className="circle"></div>
//         </div><div className="gap-patch">
//           <div className="circle"></div>
//         </div><div className="circle-clipper right">
//           <div className="circle"></div>
//         </div>
//       </div>
//     </div>
//   </div>
