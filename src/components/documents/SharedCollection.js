import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
const { getPublicKeyFromPrivate } = require('blockstack');
const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedCollection extends Component {
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
      docs: [],
      value: [],
      user: "",
      filteredValue: [],
      tempDocId: "",
      redirect: false,
      loading: "",
      img: avatarFallbackImage
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
    this.setState({ user: this.props.match.params.id });
    getFile("documentscollection.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ value: JSON.parse(fileContents || '{}').value });
         // this.setState({filteredValue: this.state.value})
         // this.setState({ loading: "hide" });
       } else {
         console.log("No docs");
       }
     })
      .catch(error => {
        console.log(error);
      });

    let publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    let fileString = 'shareddocs.json'
    let file = publicKey + fileString;
    const directory = 'shared/' + file;
    const user = this.props.match.params.id;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
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
    getFile(directory, options)
     .then((fileContents) => {
       let privateKey = loadUserData().appPrivateKey;
       console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
       this.setState({ docs: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
       console.log("loaded");
       this.save();
     })
      .catch(error => {
        console.log(error);
      });
  }

  save() {
    putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
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

  handleaddItem() {
    this.setState({ show: "hide" });
    this.setState({ hideButton: "hide", loading: "" })
    const rando = Date.now();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.id = rando;
    object.created = getMonthDayYear();

    this.setState({ value: [...this.state.value, object] });
    // this.setState({ filteredValue: [...this.state.filteredValue, object] });
    this.setState({ tempDocId: object.id });
    this.setState({ loading: "" });
    // this.setState({ confirm: true, cancel: false });
    setTimeout(this.saveNewFile, 500);
    // setTimeout(this.handleGo, 700);
  }

  saveNewFile() {
    putFile("documents.json", JSON.stringify(this.state), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        window.location.replace("/documents");
      })
      .catch(e => {
        console.log(e);
      });
  }

  renderView() {
    let docs = this.state.docs;
    if (docs.length > 0) {
      return (
        <div>
          <div className="navbar-fixed toolbar">
            <nav className="toolbar-nav">
              <div className="nav-wrapper">
                <a href="/shared-docs" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


                  <ul className="left toolbar-menu">
                    <li><a>Documents shared by {this.state.user}</a></li>
                  </ul>

              </div>
            </nav>
          </div>
          <div className="container docs">
          <div className="container">

            <h3 className="center-align">Documents {this.state.user} shared with you</h3>

            <table className="bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Shared By</th>
                  <th>Static File</th>
                  <th>Date Shared</th>
                </tr>
              </thead>
              <tbody>
            {
              docs.slice(0).reverse().map(doc => {

              return(
                <tr key={doc.id}>
                  <td><Link to={'/documents/single/shared/'+ this.state.user + '/' + doc.id}>{doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title}</Link></td>
                  <td>{this.state.user}</td>
                  <td>{doc.rtc === true ? "False" : "True"}</td>
                  <td>{doc.shared}</td>
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
              <a href="/shared-docs" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


                <ul className="left toolbar-menu">
                  <li><a>Documents shared by {this.state.user}</a></li>
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
    console.log(this.state.docs);
    const link = '/documents/doc/' + this.state.tempDocId;
    if (this.state.redirect) {
      return <Redirect push to={link} />;
    } else {
      console.log("No redirect");
    }
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
