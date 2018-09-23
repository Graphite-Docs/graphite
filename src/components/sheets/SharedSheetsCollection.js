import React, { Component } from "react";
import { Link } from 'react-router-dom';
import {
  loadUserData,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
} from 'blockstack';

const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedSheetsCollection extends Component {
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
        sharedSheets: [],
        shareFile: [],
        sheets: [],
        filteredSheets: [],
        tempSheetId: "",
        redirect: false,
        loading: "",
        user: "",
        filteredValue: [],
        img: avatarFallbackImage
      }


    }

    componentDidMount() {
      this.setState({ user: this.props.match.params.id });
      getFile("sheetscollection.json", {decrypt: true})
       .then((fileContents) => {
         if(fileContents) {
           console.log("Loaded");
           this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
           // this.setState({filteredValue: this.state.value})
           this.setState({ loading: "hide" });
         } else {
           console.log("No sheets");
           this.setState({ loading: "hide" });
         }
       })
        .catch(error => {
          console.log(error);
        });

      let fileID = loadUserData().username;
      let fileString = 'sharedsheets.json'
      let file = fileID.slice(0, -3) + fileString;
      const directory = '/shared/' + file;
      const options = { username: this.props.match.params.id, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
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
          this.setState({ shareFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
          console.log("loaded");
          this.save();
       })
        .catch(error => {
          console.log(error);
        });
    }

  save() {
    putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt: true})
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
    let sheets = this.state.shareFile;
    if (sheets.length > 0) {
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
          <div className="container">
            <h3 className="center-align">Sheets {this.state.user} shared with you</h3>
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
              sheets.slice(0).reverse().map(sheet => {

              return(
                <tr key={sheet.id}>
                  <td><Link to={'/sheets/single/shared/'+ sheet.id}>{sheet.title.length > 20 ? sheet.title.substring(0,20)+"..." :  sheet.title}</Link></td>
                  <td>{this.state.user}</td>
                  <td>{sheet.shared}</td>
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


  render() {

    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
