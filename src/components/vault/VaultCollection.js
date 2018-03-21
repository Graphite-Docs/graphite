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
      filteredValue: [],
      folders: [],
      docs: [],
      sheets: [],
      combined: []
  	};
    this.filterList = this.filterList.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
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
       this.setState({filteredValue: this.state.files});
       // this.merge();
     })
      .catch(error => {
        console.log(error);
      });

  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  filterList(event){
    var updatedList = this.state.files;
    updatedList = updatedList.filter(function(item){
      return item.name.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    this.setState({filteredValue: updatedList});
  }

  merge() {
    this.setState({ combinedFiles: this.state.files });
    console.log("Combined: " + this.state.combinedFiles);
  }

  render() {
    let files = this.state.filteredValue;
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
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="https://i.imgur.com/shB70Sn.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
              <li><a href="/profile">Profile</a></li>
              <li><a href="/shared-vault">Shared Files</a></li>

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
        <div className="">
          <form className="searchform">
          <fieldset className=" form-group searchfield">

          <input type="text" className="form-control fileform form-control-lg searchinput" placeholder="Search Files" onChange={this.filterList}/>
          </fieldset>
          </form>
        </div>

        <div className="row">

          <div className="col s12 m6 l3">
          <div className="card collections-card">
            <Link to={'/vault/new/file'}><div className="center-align new-doc card-content">
              <p><i className="addDoc red-text lighten-2 medium material-icons">add</i></p>
            </div></Link>
            <Link to={'/vault/new/file'}>
              <h5 className="center-align black-text">Upload File</h5>
            </Link>
          </div>
          </div>

          {files.slice(0).reverse().map(file => {
              return(

                <div key={file.id} className="col s12 m6 l3">

                  <div className="card collections-card hoverable horizontal">
                  <Link to={'/vault/' + file.id} className="side-card black-text file-side">
                    <div className="card-image card-image-side file-side">
                    {
                      file.type.includes("image") ? <img src="https://i.imgur.com/jLnXZXM.png" alt="image icon" /> :
                      file.type.includes("pdf") ? <img src="https://i.imgur.com/urkNBL9.png" alt="pdf icon" /> :
                      file.type.includes("word") ? <img className="icon-image" src="https://i.imgur.com/6ibKpk4.png" alt="word document" /> :
                      file.type.includes("rtf") || file.type.includes("text/plain") || file.type.includes("opendocument") ? <img className="icon-image" src="https://i.imgur.com/xADzUSW.png" alt="document" /> :
                      file.type.includes("video") ? <img className="icon-image" src="https://i.imgur.com/Hhj5KAl.png" alt="video icon" /> :
                      file.type.includes("spreadsheet") ? <img className="icon-image" src="https://i.imgur.com/1mOhZ4u.png" alt="excel file" /> :
                      file.type.includes("csv") ? <img className="icon-image" src="https://i.imgur.com/BxA1Cgv.png" alt="csv file" /> :
                      <div />
                    }
                    </div>
                    </Link>
                    <div className="card-stacked">
                    <Link to={'/vault/' + file.id} className="black-text">
                      <div className="card-content">
                        <p className="title">{file.name.length > 14 ? file.name.substring(0,17)+"..." :  file.name}</p>
                      </div>
                    </Link>
                      <div className="edit-card-action card-action">
                        <p><span className="muted muted-card">Uploaded: {file.uploaded}</span><Link to={'/vault/delete/' + file.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></p>
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

// <div className="row">
//   <div className="col s4 m2">
//     <div className="card-panel grey">
//       <span className="white-text center-align">
//         <p><i className="medium material-icons">create_new_folder</i></p>
//         <p>Create a folder</p>
//       </span>
//     </div>
//   </div>
//   {folders.slice(0).reverse().map(folder => {
//     return (
//       <div className="col s4 m2">
//         <div className="card-panel grey">
//           <span className="white-text center-align">
//             <p>{folder.name}</p>
//           </span>
//         </div>
//       </div>
//     );
//   })}
// </div>
