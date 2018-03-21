import React, { Component } from "react";
import { Link, Route, withRouter} from 'react-router-dom';
import { Redirect } from 'react-router';
import Profile from "../Profile";
import Signin from "../Signin";
import Header from "../Header";
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
} from 'blockstack';

const blockstack = require("blockstack");
const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedVaultCollection extends Component {
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
        shareFileIndex: [],
        shareFile: [],
        sheets: [],
        files: [],
        filteredFiles: [],
        tempSheetId: "",
        redirect: false,
        loading: "",
        user: "",
        fileID: "",
        name: "",
        link: "",
        type: "",
        filteredValue: [],
        img: avatarFallbackImage,
        index: ""
      }


    }

    componentWillMount() {
      if (isSignInPending()) {
        handlePendingSignIn().then(userData => {
          window.location = window.location.origin;
        });
      }
    }

    componentDidMount() {
      // this.loadFile = () => {
      //     let wholeFile = this.state.shareFileIndex;
      //     const thisFile = wholeFile.find((file) => { return file.id == this.state.fileID});
      //     let index = thisFile && thisFile.id;
      //     console.log(index);
      //     function findObjectIndex(file) {
      //         return file.id == index;
      //     }
      //     this.setState({
      //       name: thisFile && thisFile.name,
      //       link: thisFile && thisFile.link,
      //       type: thisFile && thisFile.type,
      //       index: wholeFile.findIndex(findObjectIndex)
      //     })
      //     console.log(this.state.name)
      //     console.log(this.state.link)
      //     console.log(this.state.type)
      // }

      getFile("uploads.json", {decrypt: true})
       .then((fileContents) => {
         this.setState({ files: JSON.parse(fileContents || '{}') });
         this.setState({filteredValue: this.state.files});
         // this.merge();
       })
        .catch(error => {
          console.log(error);
        });
      this.setState({ user: this.props.match.params.id });
      let fileID = loadUserData().username;
      console.log(fileID);
      let fileString = 'sharedvault.json'
      let file = fileID.slice(0, -3) + fileString;
      const directory = '/shared/' + file;
      const options = { username: this.props.match.params.id, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}
      const privateKey = loadUserData().appPrivateKey;
      getFile(directory, options)
       .then((fileContents) => {
         console.log("file contents: ")
         console.log(fileContents);
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
          this.save();
       })
        .catch(error => {
          console.log(error);
        });
    }

  save() {
    putFile("shareuser.json", JSON.stringify(this.state.user), {encrypt: true})
      .then(() => {
        console.log("saved");
      })
      .catch(e => {
        console.log(e);
      });
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  renderView() {
    console.log(this.state.user);
    var thisStyle = {
      display: "none"
    };
    const type = this.state.type;
    const { handleSignOut } = this.props;
    const { person } = this.state;
    const loading = this.state.loading;
    const show = this.state.show;
    const hideButton = this.state.hideButton;
    const shareModal = this.state.shareModal;
    const contacts = this.state.contacts;
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
              <a href="/shared-vault" className="brand-logo">
                <i className="material-icons">arrow_back</i>
              </a>

              <ul className="left toolbar-menu">
                <li>
                  <a>{this.state.name.toUpperCase()}</a>
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
                      href="#"
                      onClick={this.downloadPDF}
                      title={this.state.name}
                    >
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
                  <li>
                    <a
                      href="#"
                      onClick={this.downloadPDF}
                      title={this.state.name}
                    >
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("sheet")|| type.includes("csv") ? (
                  <li>
                    <a
                      href="#"
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
                  <a onClick={this.shareModal}>
                    <i className="material-icons">share</i>
                  </a>
                </li>
                {type.includes("word") ? (
                  <li>
                    <a href="#" onClick={this.handleaddItem}>
                      Edit in Documents
                    </a>
                  </li>
                ) : type.includes("sheet") ? (
                  <li>
                    <a href="#" onClick={this.handleaddSheet}>
                      Edit in Sheets
                    </a>
                  </li>
                ) : type.includes("csv") ? (
                  <li>
                    <a href="#" onClick={this.handleaddSheet}>
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
                      <a
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
                      <a
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
                          contextMenu: true,
                          autoRowSize: true,
                          manualColumnMove: true,
                          manualRowMove: true,
                          ref: "hot",
                          fixedRowsTop: 0,
                          minSpareRows: 1,
                          comments: true
                        }}
                      />

                      <a
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


  render() {
    if(this.state.fileID == "") {
      console.log("do nothing")
    } else {
      this.loadFile();
    }
    let files = this.state.shareFileIndex;
    console.log(files);
    const loading = this.state.loading;

    const userData = blockstack.loadUserData();
    const person = new blockstack.Person(userData.profile);
    const img = this.state.img;
    if (files.length > 0 && this.state.fileID == "") {
      return (
        <div>
          <div className="navbar-fixed toolbar">
            <nav className="toolbar-nav">
              <div className="nav-wrapper">
                <a href="/shared-vault" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


                  <ul className="left toolbar-menu">
                    <li><a>Sheets shared by {this.state.user}</a></li>
                  </ul>

              </div>
            </nav>
          </div>
          <div className="container docs">
          <div className="row">
            <h3 className="center-align">Files {this.state.user} shared with you</h3>
          {files.slice(0).reverse().map(file => {
              return (
                <div key={file.id} className="col s12 m6 l3">
                    <div className="card collections-card hoverable horizontal">
                    <Link to={'/vault/single/shared/' + file.id} className="side-card black-text file-side">
                      <div className="card-image card-image-side file-side">
                        <img src="https://i.imgur.com/7bRMkK8.png" alt="file icon" />
                      </div>
                    </Link>
                      <div className="card-stacked">
                      <Link to={'/vault/single/shared/' + file.id} className="black-text">
                        <div className="card-content">
                          <p className="title">{file.name.length > 11 ? file.name.substring(0,11)+"..." :  file.name}</p>
                        </div>
                      </Link>
                        <div className="edit-card-action card-action">
                          <p><span className="muted muted-card">Shared on: {file.uploaded}</span></p>
                        </div>
                      </div>
                    </div>
                </div>

              )
            })
          }
          </div>
          </div>
        </div>
      );
    } else if (this.state.fileID != "") {
      this.renderView();
    } else {
      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/shared-sheets" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


                <ul className="left toolbar-menu">
                  <li><a>Sheets shared by {this.state.user}</a></li>
                </ul>

            </div>
          </nav>
        </div>
        <div className="container docs">
          <h3 className="center-align">Nothing shared by {this.state.user}</h3>
        </div>
        </div>
      );
    }
  }
}
