import React, { Component } from "react";
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
} from "blockstack";
import PDF from "react-pdf-js";
import { Player } from "video-react";
import XLSX from "xlsx";
import HotTable from "react-handsontable";
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const { encryptECIES, } = require('blockstack/lib/encryption');
const avatarFallbackImage = "https://s3.amazonaws.com/onename/avatar-placeholder.png";
const mammoth = require("mammoth");
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('./rtf-to-html.js');
const Papa = require('papaparse');

export default class SingleVaultFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      person: {
        name() {
          return "Anonymous";
        },
        avatarUrl() {
          return avatarFallbackImage;
        }
      },
      files: [],
      grid: [[]],
      value: [],
      sheets: [],
      contacts: [],
      confirmAdd: false,
      file: "",
      name: "",
      link: "",
      lastModified: "",
      lastModifiedDate: "",
      size: "",
      type: "",
      index: "",
      pages: "",
      // page: "",
      page: 1, //default page value should be of type number, not string
      content: "",
      show: "hide",
      loading: "",
      shareModal: "hide",
      receiverID: "",
      shareFile: {},
      singleDoc: {},
      shareFileIndex: [],
      pubKey: "",
      sharedWith: []
    };
    this.saveNewFile = this.saveNewFile.bind(this);
    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.downloadPDF = this.downloadPDF.bind(this);
    this.handleaddItem = this.handleaddItem.bind(this);
    this.handleaddTwo = this.handleaddTwo.bind(this);
    this.handleaddSheet = this.handleaddSheet.bind(this);
    this.handleaddTwoSheet = this.handleaddTwoSheet.bind(this);
    this.saveNewSheetFile = this.saveNewSheetFile.bind(this);
    this.shareModal = this.shareModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.shareFile = this.shareFile.bind(this);
    this.sharedInfo = this.sharedInfo.bind(this);
    this.saveNewFileTwo = this.saveNewFileTwo.bind(this);
  }

  componentDidMount() {
    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("Contacts are here");
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
       } else {
         console.log("No contacts");
       }
     })
      .catch(error => {
        console.log(error);
      });

      getFile("uploads.json", {decrypt: true})
       .then((fileContents) => {
          this.setState({ files: JSON.parse(fileContents || '{}') })
          console.log("loaded");
          this.setState({ initialLoad: "hide" });
       }).then(() => {
         let files = this.state.files;
         const thisFile = files.find((file) => { return file.id.toString() === this.props.match.params.id}); //this is comparing strings
         console.log("SingleVaultFile - componentDidMount - thisFile is: ", thisFile);
         let index = thisFile && thisFile.id;
         console.log("SingleVaultFile - componentDidMount - index is: ", index);
         function findObjectIndex(file) {
             return file.id === index; //this is comparing numbers
         }
         // let grid = thisSheet && thisSheet.content;
         this.setState({ tags: thisFile && thisFile.tags, sharedWith: thisFile && thisFile.sharedWith, index: files.findIndex(findObjectIndex) })
         // console.log(this.state.title);
       })
        .catch(error => {
          console.log(error);
        });

    getFile(this.props.match.params.id + ".json", { decrypt: true })
      .then(file => {
        this.setState({
          file: JSON.parse(file || "{}").name,
          name: JSON.parse(file || "{}").name,
          lastModifiedDate: JSON.parse(file || "{}").lastModifiedDate,
          size: JSON.parse(file || "{}").size,
          link: JSON.parse(file || "{}").link,
          type: JSON.parse(file || "{}").type,
          sharedWith: JSON.parse(file || "{}").sharedWith,
          tags: JSON.parse(file || "{}").tags
        });
        if (this.state.type.includes("word")) {
          var abuf4 = str2ab(this.state.link);
          mammoth
            .convertToHtml({ arrayBuffer: abuf4 })
            .then(result => {
              var html = result.value; // The generated HTML
              this.setState({ content: html });
              console.log(this.state.content);
              this.setState({ loading: "hide", show: "" });
            })
            .done();
        }

        else if (this.state.type.includes("rtf")) {
          let base64 = this.state.link.split("data:text/rtf;base64,")[1];
          rtfToHTML.fromString(window.atob(base64), (err, html) => {
            console.log(window.atob(base64));
            console.log(html)
            let htmlFixed = html.replace("body", ".noclass");
            this.setState({ content:  htmlFixed});
            this.setState({ loading: "hide", show: "" });
          })
        }

        else if (this.state.type.includes("text/plain")) {
          let base64 = this.state.link.split("data:text/plain;base64,")[1];
          console.log(window.atob(base64));
          this.setState({ loading: "hide", show: "" });
          this.setState({ content: window.atob(base64) });
        }

        else if (this.state.type.includes("sheet")) {
          // var abuf4 = str2ab(this.state.link);
          var wb = XLSX.read(abuf4, { type: "buffer" });
          var first_worksheet = wb.Sheets[wb.SheetNames[0]];
          var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
          console.log(data);
          // console.log("result: ")
          // console.log(wb);
          this.setState({ grid: data });
          this.setState({ loading: "hide", show: "" });
        }

        else if (this.state.type.includes("csv")) {
          let base64 = this.state.link.split("data:text/csv;base64,")[1];
          console.log(Papa.parse(window.atob(base64)).data);
          this.setState({ grid: Papa.parse(window.atob(base64)).data });
          this.setState({ loading: "hide", show: "" });
        }

        else {
          this.setState({ loading: "hide", show: "" });
        }
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

  onDocumentComplete(pages) {
    this.setState({ page: 1, pages });
  }

  onPageComplete(page) {
    this.setState({ page });
  }

  handlePrevious() {
    this.setState({ page: this.state.page - 1 });
  }

  handleNext() {
    this.setState({ page: this.state.page + 1 });
  }

  downloadPDF() {
    var dlnk = document.getElementById("dwnldLnk");
    dlnk.href = this.state.link;

    dlnk.click();
  }

  handleaddItem() {
    getFile("documentscollection.json", { decrypt: true })
      .then(fileContents => {
        if (fileContents) {
          this.setState({ value: JSON.parse(fileContents || "{}").value });
        } else {
          console.log("No docs");
        }
      })
      .then(() => {
        this.handleaddTwo();
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleaddSheet() {
    getFile("spread.json", { decrypt: true })
      .then(fileContents => {
        this.setState({ sheets: JSON.parse(fileContents || "{}").sheets });
        console.log("Sheets added");
      })
      .then(() => {
        this.handleaddTwoSheet();
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleaddTwo() {
    this.setState({ show: "hide" });
    this.setState({ hideButton: "hide", loading: "" });
    const rando = Date.now();
    const object = {};
    object.title = this.state.name;
    object.content = this.state.content;
    object.id = rando;
    object.created = getMonthDayYear();
    object.fileType = "vault";
    const objectTwo = {}
    objectTwo.title = object.title;
    objectTwo.id = object.id;
    objectTwo.created = object.created;
    objectTwo.content = object.content;
    objectTwo.fileType = "vault";

    this.setState({ value: [...this.state.value, object], singleDoc: objectTwo });
    this.setState({ loading: "" });
    console.log(this.state.singleDoc)
    setTimeout(this.saveNewFile, 500);
  }

  handleaddTwoSheet() {
    this.setState({ show: "hide" });
    this.setState({ hideButton: "hide", loading: "" });
    const rando = Date.now();
    const object = {};
    object.title = this.state.name;
    object.content = this.state.grid;
    object.id = rando;
    object.created = getMonthDayYear();

    this.setState({ sheets: [...this.state.sheets, object] });
    this.setState({ loading: "" });
    console.log("adding new sheet");
    setTimeout(this.saveNewSheetFile, 500);
  }

  saveNewFile() {
    putFile("documentscollection.json", JSON.stringify(this.state), { encrypt: true })
      .then(() => {
        console.log("Saved!");
        this.saveNewFileTwo();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveNewFileTwo() {
    let singleDoc = this.state.singleDoc;
    const id = singleDoc.id;
    const fullFile = '/documents/' + id + '.json'
    putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        window.location.replace("/documents");
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveNewSheetFile() {
    putFile("spread.json", JSON.stringify(this.state), { encrypt: true })
      .then(() => {
        console.log("Saved!");
        window.location.replace("/sheets");
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  shareModal() {
    this.setState({
      shareModal: ""
    });
  }

  sharedInfo(){
    this.setState({ confirmAdd: false });
    const user = this.state.receiverID;
    // const userShort = user.slice(0, -3);
    // const fileName = 'sharedvault.json'
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
          this.setState({ shareModal: "hide", loading: "hide", show: "" });
        });
  }

  loadMyFile() {
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const fileName = 'sharedvault.json'
    const file = userShort + fileName;
    // const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}



    getFile(file, {decrypt: true})
     .then((fileContents) => {
        this.setState({ shareFileIndex: JSON.parse(fileContents || '{}') })
        console.log("Step Two: Loaded share file");
        this.setState({ loading: "", show: "hide" });
        const object = {};
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        object.uploaded = month + '/' + day + '/' + year;
        object.file = file;
        object.link = this.state.link;
        object.name = this.state.name;
        object.size = this.state.size;
        object.type = this.state.type;
        object.lastModified = this.state.lastModified;
        object.lastModifiedDate = this.state.lastModifiedDate;
        object.id = Date.now();
        this.setState({ shareFile: object, shareFileIndex: [...this.state.shareFileIndex, object] });
        setTimeout(this.shareFile, 700);
     })
      .catch(error => {
        console.log(error);
        console.log("Step Two: No share file yet, moving on");
        this.setState({ loading: "", show: "hide" });
        const object = {};
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        object.uploaded = month + '/' + day + '/' + year;
        object.file = file;
        object.link = this.state.link;
        object.name = file.name;
        object.size = file.size;
        object.type = file.type;
        object.lastModified = file.lastModified;
        object.lastModifiedDate = file.lastModifiedDate;
        object.id = Date.now();
        this.setState({ shareFile: object, shareFileIndex: [...this.state.shareFileIndex, object] });
        setTimeout(this.shareFile, 700);
      });
  }

  hideModal() {
    this.setState({
      shareModal: "hide"
    });
  }

  shareFile() {
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const fileName = 'sharedvault.json'
    const file = userShort + fileName;
    putFile(file, JSON.stringify(this.state.shareFileIndex), {encrypt: true})
      .then(() => {
        console.log("Step Three: File Shared: " + this.state.shareFileIndex);
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
      putFile(userShort + this.props.match.params.id + '.json', JSON.stringify(this.state.shareFile), {encrypt: true})
        .then(() => {
          console.log(userShort + this.props.match.params.id + '.json')
          // console.log("Step Four: File Shared: " + this.state.shareFile);
          this.setState({ shareModal: "hide", loading: "hide", show: "" });
          window.Materialize.toast('File shared with ' + this.state.receiverID, 4000);
        })
        .catch(e => {
          console.log("e");
          console.log(e);
        });
      const publicKey = this.state.pubKey;
      const data = this.state.shareFileIndex;
      const dataTwo = this.state.shareFile;
      const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
      const encryptedDataTwo = JSON.stringify(encryptECIES(publicKey, JSON.stringify(dataTwo)));
      const directory = '/shared/' + file;
      putFile(directory, encryptedData, {encrypt: false})
        .then(() => {

          console.log("Shared encrypted fileIndex" + directory);
        })
        .catch(e => {
          console.log(e);
        });
      putFile('/shared/' + userShort + this.props.match.params.id + '.json', encryptedDataTwo, {encrypt: false})
        .then(() => {
          console.log("Shared encrypted file");
          console.log(dataTwo);
          this.handleaddItem();
        })
        .catch(e => {
          console.log(e);
        });
  }

  renderPagination(page, pages) {
    let previousButton = (
      <li className="previous" onClick={this.handlePrevious}>
        <a>
          <i className="fa fa-arrow-left" /> Previous
        </a>
      </li>
    );
    if (page === 1) {
      previousButton = (
        <li className="previous disabled">
          <a>
            <i className="fa fa-arrow-left" /> Previous
          </a>
        </li>
      );
    }
    let nextButton = (
      <li className="next" onClick={this.handleNext}>
        <a>
          Next <i className="fa fa-arrow-right" />
        </a>
      </li>
    );
    if (page === pages) {
      nextButton = (
        <li className="next disabled">
          <a>
            Next <i className="fa fa-arrow-right" />
          </a>
        </li>
      );
    }
    return (
      <nav>
        <ul className="pager">
          {previousButton}
          {nextButton}
        </ul>
      </nav>
    );
  }

  render() {
    var thisStyle = {
      display: "none"
    };
    const type = this.state.type;
    // const { handleSignOut } = this.props;
    // const { person } = this.state;
    const loading = this.state.loading;
    const show = this.state.show;
    // const hideButton = this.state.hideButton;
    const shareModal = this.state.shareModal;
    const contacts = this.state.contacts;
    let pagination = null;
    if (this.state.pages) {
      pagination = this.renderPagination(this.state.page, this.state.pages);
    }
    return !isSignInPending() ? (
      <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/vault" className="brand-logo left">
                <i className="material-icons small-brand">arrow_back</i>
              </a>

              <ul className="left toolbar-menu">
                <li>
                  <a className="small-menu">{this.state.name.length > 14 ? this.state.name.substring(0,17).toUpperCase() +"..." : this.state.name.toUpperCase()}</a>
                </li>
                {type.includes("image") ? (
                  <li>
                    <a href={this.state.link} download={this.state.name}>
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("video") ? (
                  <li>
                    <a href={this.state.link} download={this.state.name}>
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("application/pdf") ? (
                  <li>
                    <a
                      onClick={this.downloadPDF}
                      title={this.state.name}
                    >
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
                  <li>
                    <a
                      onClick={this.downloadPDF}
                      title={this.state.name}
                    >
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("sheet")|| type.includes("csv") ? (
                  <li>
                    <a
                      onClick={this.downloadPDF}
                      title={this.state.name}
                    >
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : (
                  <li />
                )}
                {/*<li>
                  <a onClick={this.shareModal}>
                    <i className="material-icons">share</i>
                  </a>
                </li>*/}
                {type.includes("word") ? (
                  <li>
                    <a onClick={this.handleaddItem}>
                      Edit in Documents
                    </a>
                  </li>
                ) : type.includes("sheet") ? (
                  <li>
                    <a onClick={this.handleaddSheet}>
                      Edit in Sheets
                    </a>
                  </li>
                ) : type.includes("csv") ? (
                  <li>
                    <a onClick={this.handleaddSheet}>
                      Edit in Sheets
                    </a>
                  </li>
                ) : (
                  <li />
                )}
              </ul>
            </div>
          </nav>
        </div>

        <div className={shareModal}>

          <div id="modal1" className="modal bottom-sheet">
            <div className="modal-content">
              <h4>Share</h4>
              <p>Select from your contacts.</p>
              <div className={show}>
                <button onClick={this.hideModal} className="btn grey">Cancel</button>
              </div>
              <div className={show}>
                <div className="container">
                  <h4 className="contacts-share center-align">Your Contacts</h4>
                  <ul className="collection">
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

        <div className="container">
          <div className={loading}>
            <div className="file-loading progress">
              <div className="indeterminate" />
            </div>
          </div>
        </div>
        <div className={show}>
          <div className="file-view">
            <div className="">
              <div>
                {type.includes("image") ? (
                  <div className="single-file-div center-align">
                    <img
                      className="z-depth-4 responsive-img"
                      src={this.state.link}
                      alt={this.state.name}
                    />
                  </div>
                ) : type.includes("pdf") ? (
                  <div className="center-align container">
                    <div className="single-file-div">
                      <PDF
                        className="card"
                        file={this.state.link}
                        onDocumentComplete={this.onDocumentComplete}
                        onPageComplete={this.onPageComplete}
                        page={this.state.page}
                      />
                      {pagination}
                      <link
                        id="dwnldLnk"
                        download={this.state.name}
                        style={thisStyle}
                      />
                    </div>
                  </div>
                ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
                  <div className="">
                    <div className={loading}>
                      <div className="edit-button">
                        <div className="preloader-wrapper small active">
                          <div className="spinner-layer spinner-green-only">
                            <div className="circle-clipper left">
                              <div className="circle" />
                            </div>
                            <div className="gap-patch">
                              <div className="circle" />
                            </div>
                            <div className="circle-clipper right">
                              <div className="circle" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="container">
                      <div className="card single-file-doc">
                        <div
                          className="print-view no-edit"
                          dangerouslySetInnerHTML={{
                            __html: this.state.content
                          }}
                        />
                      </div>
                      <link
                        id="dwnldLnk"
                        download={this.state.name}
                        style={thisStyle}
                      />
                    </div>
                  </div>
                ) : type.includes("video") ? (
                  <div className="single-file-div">
                    <div className="center-align container">
                      <Player playsInline src={this.state.link} />
                    </div>
                  </div>
                ) : type.includes("sheet") || type.includes("csv") ? (
                  <div>
                    <div className="spreadsheet-table">
                      <HotTable
                        root="hot"
                        settings={{
                          data: this.state.grid,
                          readOnly: true,
                          stretchH: "all",
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
                          autoRowSize: true,
                          manualColumnMove: true,
                          manualRowMove: true,
                          ref: "hot",
                          fixedRowsTop: 0,
                          minSpareRows: 1,
                          comments: true
                        }}
                      />

                      <link
                        id="dwnldLnk"
                        download={this.state.name}
                        style={thisStyle}
                      />
                    </div>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile)
    });
  }
}
