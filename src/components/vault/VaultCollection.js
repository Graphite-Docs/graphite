import React, { Component } from 'react';
import {
isSignInPending,
loadUserData,
Person,
getFile,
putFile,
lookupProfile,
signUserOut,
} from 'blockstack';
import { Link } from 'react-router-dom';
import Dropzone from 'react-dropzone'

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class VaultCollection extends Component {
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
      files: [],
      folders: [],
      docs: [],
      sheets: [],
      combined: []
  	};
  }

  componentDidMount() {
    getFile("documents.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ docs: JSON.parse(fileContents || '{}').value });
       } else {
         console.log("No saved docs");
       }
     })
      .catch(error => {
        console.log(error);
      });

    getFile("spread.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("Files are here");
         this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
       } else {
         console.log("Nothing to see here");
         // this.setState({ value: {} });
         // this.setState({ filteredValue: {} })
         // console.log(this.state.value);
         this.setState({ loading: "hide" });
       }
     })
      .catch(error => {
        console.log(error);
      });

    getFile("uploads.json", {decrypt: true})
     .then((fileContents) => {
       this.setState({ files: JSON.parse(fileContents || '{}') });
       this.merge();
     })
      .catch(error => {
        console.log(error);
      });

  }

  merge() {
    this.setState({ combinedFiles: this.state.files });
    console.log("Combined: " + this.state.combinedFiles);
  }

  render() {
    let files = this.state.files;
    let folders = this.state.folders;
    let docs = this.state.docs;
    let sheets = this.state.sheets;

    console.log(files);
    const { handleSignOut } = this.props;
    const { person } = this.state;
    return (
      !isSignInPending() ?
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="http://www.iconsplace.com/icons/preview/white/pencil-256.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
              <li><a href="/profile">Profile</a></li>
              <li><a href="/shared-sheets">Shared Files</a></li>
              <li><a href="/export">Export All Data</a></li>
              <li className="divider"></li>
              <li><a href="#" onClick={ this.handleSignOut }>Sign out</a></li>
            </ul>
            <ul id="dropdown2" className="dropdown-content">
            <li><a href="/documents"><img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" className="dropdown-icon" /><br />Documents</a></li>
            <li><a href="/sheets"><img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" className="dropdown-icon-bigger" /><br />Sheets</a></li>
            <li><a href="/contacts"><img src="https://i.imgur.com/st3JArl.png" alt="contacts-icon" className="dropdown-icon" /><br />Contacts</a></li>
            <li><a href="/conversations"><img src="https://i.imgur.com/cuXF1V5.png" alt="conversations-icon" className="dropdown-icon-bigger" /><br />Conversations</a></li>
            </ul>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown2"><i className="material-icons apps">apps</i></a></li>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown1"><img src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" /><i className="material-icons right">arrow_drop_down</i></a></li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="docs">
        <h3 className="center-align">Your Files</h3>
        <div className="row">
          <div className="col s4 m2">
            <div className="card-panel grey">
              <span className="white-text center-align">
                <p><i className="medium material-icons">create_new_folder</i></p>
                <p>Create a folder</p>
              </span>
            </div>
          </div>
          {folders.slice(0).reverse().map(folder => {
            return (
              <div className="col s4 m2">
                <div className="card-panel grey">
                  <span className="white-text center-align">
                    <p>{folder.name}</p>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="row">
          <div className="col s6 m3">
          <div className="card small">
            <Link to={'/vault/new/file'}><div className="center-align card-content">
              <p><i className="addDoc large material-icons">add</i></p>
            </div></Link>
            <Link to={'/vault/new/file'}><div className="card-action">
              <a className="black-text">Upload File</a>
            </div></Link>
          </div>
          </div>

          {files.slice(0).reverse().map(file => {
              return(
                <div key={file.id} className="col s6 m3">

                  <div className="card small renderedDocs">
                  <Link to={'/vault/' + file.id} className="black-text">
                    <div className="center-align card-content">
                    {
                      file.type.includes("image") ? <p><i className="vault large material-icons">photo</i></p> :
                      file.type.includes("pdf") ? <p><i className="vault large material-icons">picture_as_pdf</i></p> :
                      file.type.includes("word") ? <img className="icon-image" src="https://image.flaticon.com/icons/svg/732/732078.svg" alt="word document" /> :
                      file.type.includes("video") ? <p><i className="vault large material-icons">video_library</i></p> :
                      file.type.includes("spreadsheet") ? <img className="icon-image" src="https://image.flaticon.com/icons/svg/1/1396.svg" alt="excel file" /> :
                      <div />
                    }
                    </div>
                    </Link>
                    <div className="card-action">
                      <Link to={'/vault/' + file.id}><a className="black-text">{file.name.length > 14 ? file.name.substring(0,17)+"..." :  file.name}</a></Link>
                      <Link to={'/vault/delete/' + file.id}>

                          <i className="modal-trigger material-icons red-text delete-button">delete</i>

                      </Link>
                      <div className="muted">
                        <p>Last updated: {file.lastModifiedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

              )
              })
            }

        </div>
      </div>
      </div> : null
    );
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
    });
  }
}
