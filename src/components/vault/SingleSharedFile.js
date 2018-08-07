import React, { Component } from "react";
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
} from "blockstack";
import PDF from "react-pdf-js";
import { Player } from "video-react";
import XLSX from "xlsx";
import HotTable from "react-handsontable";
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = "https://s3.amazonaws.com/onename/avatar-placeholder.png";
const mammoth = require("mammoth");
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('./rtf-to-html.js');
const Papa = require('papaparse');

export default class SingleSharedFile extends Component {
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
      file: "",
      name: "",
      link: "",
      lastModified: "",
      lastModifiedDate: "",
      size: "",
      type: "",
      index: "",
      pages: "",
      page: "",
      content: "",
      show: "hide",
      loading: "",
      shareModal: "hide",
      receiverID: "",
      shareFile: {},
      shareFileIndex: [],
      singleFile: {},
      pubKey: "",
      wholeFile: "",
      user: ""
    };
    this.saveNewFile = this.saveNewFile.bind(this);
    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.downloadPDF = this.downloadPDF.bind(this);
    this.handleaddItem = this.handleaddItem.bind(this);
    this.handleaddTwo = this.handleaddTwo.bind(this);
    this.saveNewTwo = this.saveNewTwo.bind(this);
  }

  componentDidMount() {

    getFile("shareuser.json", {decrypt: true})
     .then((fileContents) => {
        this.setState({ user: JSON.parse(fileContents || '{}') });
     })
     .then(() => {
       let fileID = loadUserData().username;
       console.log(fileID);
       let fileString = 'sharedvault.json'
       let file = fileID.slice(0, -3) + fileString;
       const directory = '/shared/' + file;
       const options = { username: this.state.user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
       const privateKey = loadUserData().appPrivateKey;
       getFile(directory, options)
        .then((fileContents) => {
          lookupProfile(this.state.user, "https://core.blockstack.org/v1/names")
            .then((profile) => {
              let image = profile.image;
              console.log(profile);
              if(profile.image){
                this.setState({img: image[0].contentUrl})
              } else {
                this.setState({ img: avatarFallbackImage })
              }
            })
            .catch((error) => {
              console.log('could not resolve profile')
            })
           this.setState({ shareFileIndex: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
           console.log("loaded");
           let wholeFile = this.state.shareFileIndex;
           console.log(wholeFile)
           const thisFile = wholeFile.find((file) => {return file.id.toString() === this.props.match.params.id}); //this is comparing strings
           let index = thisFile && thisFile.id;
           console.log(index);
           function findObjectIndex(file) {
               return file.id === index; //this is comparing numbers
           }
           this.setState({
             name: thisFile && thisFile.name,
             link: thisFile && thisFile.link,
             type: thisFile && thisFile.type,
             index: wholeFile.findIndex(findObjectIndex)
           })
           console.log(this.state.name)
           console.log(this.state.link)
           console.log(this.state.type)
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
     })
      .catch(error => {
        console.log(error);
      });
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
    getFile("uploads.json", { decrypt: true })
      .then(fileContents => {
        if (fileContents) {
          this.setState({ files: JSON.parse(fileContents || "{}") });
        } else {
          console.log("No files");
        }
      })
      .then(() => {
        this.handleaddTwo();
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleaddTwo() {
    this.setState({ show: "hide" });
    this.setState({ hideButton: "hide", loading: "" });

    const object = {};
    object.link = this.state.link;
    object.name = this.state.name;
    object.size = this.state.size;
    object.type = this.state.type;
    object.uploaded = getMonthDayYear();
    object.id = this.props.match.params.id;

    this.setState({ files: [...this.state.files, object] });
    this.setState({ singleFile: object });
    this.setState({ loading: "" });
    setTimeout(this.saveNewFile, 500);
  }

  saveNewFile() {
    putFile("uploads.json", JSON.stringify(this.state.files), { encrypt: true })
      .then(() => {
        console.log("Saved!");
        this.saveNewTwo();

      })
      .catch(e => {
        console.log("e");
        console.log(e);

      });
  }

  saveNewTwo() {
    const file = this.props.match.params.id + '.json';
    putFile(file, JSON.stringify(this.state.singleFile), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        window.location.replace("/vault");
      })
      .catch(e => {
        console.log("e");
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
    console.log(this.state.user);
    var thisStyle = {
      display: "none"
    };
    const type = this.state.type;
    const loading = this.state.loading;
    const show = this.state.show;
    let pagination = null;
    if (this.state.pages) {
      pagination = this.renderPagination(this.state.page, this.state.pages);
    }
    console.log(this.state.type);
    return !isSignInPending() ? (
      <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/shared-vault" className="brand-logo left">
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
                <li>
                  <a className="small-menu" onClick={this.handleaddItem}>
                    Add to Vault
                  </a>
                </li>
              </ul>
            </div>
          </nav>
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
