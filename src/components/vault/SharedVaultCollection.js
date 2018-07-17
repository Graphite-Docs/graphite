import React, { Component } from "react";
import { Link } from 'react-router-dom';
import PDF from "react-pdf-js";
import { Player } from "video-react";
import HotTable from "react-handsontable";
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
} from 'blockstack';
const { decryptECIES } = require('blockstack/lib/encryption');
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
      const options = { username: this.props.match.params.id, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
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
                  <a onClick={this.shareModal}>
                    <i className="material-icons">share</i>
                  </a>
                </li>
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
                      <a className="hide"
                        id="dwnldLnk"
                        download={this.state.name}
                        style={thisStyle}
                      >Download</a>
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
                        className="hide"
                        id="dwnldLnk"
                        download={this.state.name}
                        style={thisStyle}
                      >Download</a>
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

                      <a
                        className="hide"
                        id="dwnldLnk"
                        download={this.state.name}
                        style={thisStyle}
                      >Download</a>
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
    if(this.state.fileID === "") {
      console.log("do nothing")
    } else {
      this.loadFile();
    }
    let files = this.state.shareFileIndex;
    if (files.length > 0 && this.state.fileID === "") {
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
          <div className="container">
            <h3 className="center-align">Files {this.state.user} shared with you</h3>

            <table className="bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Shared By</th>
                  <th>Date Shared</th>
                </tr>
              </thead>
              <tbody>
            {
              files.slice(0).reverse().map(file => {

              return(
                <tr key={file.id}>
                  <td><Link to={'/vault/single/shared/' + file.id}>{file.name.length > 20 ? file.name.substring(0,20)+"..." :  file.name}</Link></td>
                  <td>{this.state.user}</td>
                  <td>{file.uploaded}</td>
                </tr>
              );
              })
            }
            </tbody>
          </table>


          </div>
          </div>
        </div>
      );
    } else if (this.state.fileID !== "") {
      this.renderView();
    } else {
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
          <h3 className="center-align">Nothing shared by {this.state.user}</h3>
        </div>
        </div>
      );
    }
  }
}
