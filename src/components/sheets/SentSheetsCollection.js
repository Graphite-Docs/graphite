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
import update from 'immutability-helper';
const blockstack = require("blockstack");
const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
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
      img: avatarFallbackImage,
      deleteId: "",
      pubKey: ""
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
    this.setState({user: this.props.match.params.id});
    const user = this.props.match.params.id;
    const userShort = user.slice(0, -3);
    const fileName = 'sharedsheets.json'
    const file = userShort + fileName;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}

    getFile('key.json', options)
      .then((file) => {
        this.setState({ pubKey: JSON.parse(file)})
      })
      .catch(error => {
        console.log(error);
      });

    getFile("spread.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
         this.setState({ loading: "hide" });
       } else {
         this.setState({ loading: "hide" });
       }
     })
      .catch(error => {
        console.log(error);
      });

    let fileID = this.props.match.params.id;
    let fileOne = fileID.slice(0, -3) + fileName;
    getFile(fileOne, {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("loaded");
         this.setState({ sharedSheets: JSON.parse(fileContents || '{}') });
       } else {
         console.log("Nothing shared");
       }
     })
      .catch(error => {
        console.log(error);
      });

      this.deleteShareDoc = () => {
        this.setState({deleteId: ""})
        let sharedSheets = this.state.sharedSheets;
        const thisSheet = sharedSheets.find((sheet) => { return sheet.id == this.state.deleteId});
        let index = thisSheet && thisSheet.id;
        function findObjectIndex(sheet) {
          return sheet.id == index;
        }
        let deleteIndex = sharedSheets.findIndex(findObjectIndex)
        let updatedSheet = update(this.state.sharedSheets, {$splice: [[deleteIndex, 1, ]]})
        this.setState({sharedSheets: updatedSheet})
        setTimeout(this.saveEncrypted, 1000);
      }

      this.saveEncrypted = () => {
        const user = this.props.match.params.id;
        const userShort = user.slice(0, -3);
        const fileName = 'sharedsheets.json'
        const file = userShort + fileName;
        const publicKey = this.state.pubKey;
        const data = this.state.sharedSheets;
        const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
        const directory = '/shared/' + file;
        putFile(directory, encryptedData)
          .then(() => {
            const user = this.props.match.params.id;
            const userShort = user.slice(0, -3);
            const fileName = 'sharedsheets.json'
            const file = userShort + fileName;
            putFile(file, JSON.stringify(this.state.sharedSheets), {encrypt: true})
              .then(() => {
                Materialize.toast('Sheet no longer shared', 3000);
              })
              .catch(e => {
                console.log(e);
              });
          })
          .catch(e => {
            console.log(e);
          });
      }
}

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }


  renderView() {
    let sheets = this.state.sharedSheets;
    const loading = this.state.loading;
    const userData = blockstack.loadUserData();
    const person = new blockstack.Person(userData.profile);
    const img = this.state.img;
    if(this.state.deleteId != "") {
      this.deleteShareDoc();
    }
    if (sheets.length > 0) {
      return (
        <div>
          <div className="navbar-fixed toolbar">
            <nav className="toolbar-nav">
              <div className="nav-wrapper">
                <a href="/shared-sheets" className="left brand-logo"><i className="material-icons">arrow_back</i></a>
              </div>
            </nav>
          </div>
          <div className="container docs">
          <div className="row">

            <h3 className="center-align">Sheets you shared with {this.state.user}</h3>
          {sheets.slice(0).reverse().map(sheet => {
              return (
                <div key={sheet.id} className="col s12 m6 l3">
                    <div className="card collections-card hoverable horizontal">
                    <div className="side-card black-text sheets-side">
                      <div className="card-image card-image-side sheets-side">
                        <img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" />
                      </div>
                    </div>
                      <div className="card-stacked">
                      <div className="black-text">
                        <div className="card-content">
                          <p className="title">{sheet.title.length > 11 ? sheet.title.substring(0,11)+"..." :  sheet.title}</p>
                        </div>
                      </div>
                        <div className="edit-card-action card-action">
                        <p><span className="muted muted-card">Shared on: {sheet.shared}</span><a onClick={() => this.setState({ deleteId: sheet.id})}>

                            <i className="modal-trigger material-icons red-text delete-button">delete</i>

                        </a></p>
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
    const loading = this.state.loading;
    const userData = blockstack.loadUserData();
    const person = new blockstack.Person(userData.profile);
    const img = this.state.img;

    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
