import React, { Component } from "react";
import { Link } from 'react-router-dom';
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import Loading from '../shared/Loading';
import {Menu as MainMenu, Icon} from 'semantic-ui-react';
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
      loading: false,
      printPreview: false,
      autoSave: "Saved",
      receiverID: "",
      shareModal: "hide",
      hideButton: "",
      shareFile: [],
      show: "",
      img: avatarFallbackImage,
      singleSheet: {}
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
  }

  componentDidMount() {
    this.setState({ loading: true });
    getFile("sheetscollection.json", {decrypt: true})
     .then((fileContents) => {
       console.log(JSON.parse(fileContents))
       if(fileContents) {
         this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
         this.setState({ user: JSON.parse(fileContents || '{}').user });
         // this.refresh = setInterval(() => this.getOther(), 1000);
       } else {
         console.log("No sheets");
       }
     })
     .then(() => {
       this.getOther();
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
  const user = window.location.href.split('shared/')[1].split('/')[0];
  const directory = '/shared/' + file;
  const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  console.log(user);
  getFile(directory, options)
  .then((fileContents) => {
    let privateKey = loadUserData().appPrivateKey;
    console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))))
    this.setState({ shareFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
    console.log("loaded");
    let allSheets = this.state.shareFile;
    // let sheets = allSheets.shareFile;
    const thisSheet = allSheets.find((sheet) => { return sheet.id.toString() === window.location.href.split('shared/')[1].split('/')[1]}); //this is comparing strings
    let index = thisSheet && thisSheet.id;
    console.log(index);
    function findObjectIndex(sheet) {
        return sheet.id === index; //this is comparing numbers
    }
    this.setState({ grid: thisSheet && thisSheet.content, title: thisSheet && thisSheet.title, index: allSheets.findIndex(findObjectIndex), loading: false })
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
        tempSheetId: object.id,
        singleSheet: object,
        loading: ""
       });
      // this.setState({ confirm: true, cancel: false });
      setTimeout(this.saveNewFile, 500);
      // setTimeout(this.handleGo, 700);
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

    saveSingleSheet = () => {
      const file = this.state.tempSheetId;
      const fullFile = '/sheets/' + file + '.json'
      putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt:true})
        .then(() => {
          window.location.replace('/sheets');
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
    const { title, loading } = this.state;
    if(!loading) {
      return(
      <div>
      <MainMenu className='shared-sheet-menu' style={{ borderRadius: "0", background: "#282828", color: "#fff", height: "100px", paddingBottom: "30px" }}>
        <MainMenu.Item onClick={this.props.handleBack}>
          <Link style={{color: "#fff"}} to={'/shared-sheets'}><Icon name='arrow left' /></Link>
        </MainMenu.Item>
        <MainMenu.Item style={{color: "#fff"}}>
        {
          title
          ?
          (title.length > 15 ? title.substring(0,15)+"..." : title)
          :
          "Title here..."
        }
        </MainMenu.Item>
        <MainMenu.Item>
          <a style={{color: "#fff"}} onClick={this.handleaddItem}>Add to Sheets</a>
        </MainMenu.Item>
        </MainMenu>
      <div className="">

          <div className="spreadsheet-table1">
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
    } else {
      return (
        <Loading />
      )
    }
  }

  render() {

    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
