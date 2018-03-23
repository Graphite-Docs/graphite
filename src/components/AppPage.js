import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Profile from './Profile';
import Signin from './Signin';
import Header from './Header';
import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  handlePendingSignIn,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
} from 'blockstack';
const blockstack = require("blockstack");


export default class AppPage extends Component {

  constructor(props) {
  	super(props);
  }

  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin
    redirectToSignIn(origin, origin + '/manifest.json', ['store_write', 'publish_data'])
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  render() {


    return (
      <div>
      <Header />
      <div className="site-wrapper">
        <div className="site-wrapper-inner">
          { !isUserSignedIn() ?
            <Signin handleSignIn={ this.handleSignIn } />
            :
            <div>
            <div className="row app-list">
              <div className="col s12 m6 l2 offset-l1 app-page">
                <a className="black-text" href="/documents">
                  <div id="apps" className="center-align app-card docs-card row">
                    <p className="col s3 m12 center-align"><div className="icon docs-icon"><img className=""src='https://i.imgur.com/C71m2Zs.png' /></div></p>

                    <h4 className="col m12 s9 app-headers">Documents</h4>
                    <h5>Create a new document or work on an existing document with full encryption.</h5>

                  </div>
                </a>
              </div>
              <div className="col s12 m6 l2 app-page">
                <a className="black-text" href="/sheets">
                  <div className="center-align app-card row sheets-card">
                    <p className="col s3 m12 center-align"><div className="icon sheets-icon"><img className="responsive-img" src='https://i.imgur.com/6jzdbhE.png' /></div></p>

                    <h4 className="col m12 s9 app-headers">Sheets</h4>
                    <h5>Work on a sheet, run calculations, make plans, retain privacy.</h5>

                  </div>
                </a>
              </div>
              <div className="col s12 m6 l2 app-page">
                <a className="black-text" href="/contacts">
                  <div className="center-align app-card row contacts-card">
                    <p className="col s3 m12 center-align"><div className="icon contacts-icon"><img className=""src='https://i.imgur.com/st3JArl.png' /></div></p>

                    <h4 className="col m12 s9 app-headers">Contacts</h4>
                    <h5>Control who you share with and who can share with you.</h5>

                  </div>
                </a>
              </div>
              <div className="col s12 m6 l2 app-page">
                <a className="black-text" href="/conversations">
                  <div className="center-align app-card row convos">
                    <p className="col s3 m12 center-align"><div className="icon conversations-icon"><img className="" src='https://i.imgur.com/cuXF1V5.png' /></div></p>

                    <h4 className="col m12 s9 app-headers">Conversations</h4>
                    <h5>Encrypted messages without a central authority looking over your shoulder.</h5>

                  </div>
                </a>
              </div>
              <div className="col s12 m6 l2 app-page">
                <a className="black-text" href="/vault">
                  <div id="apps" className="center-align app-card files-card row">
                    <p className="col s3 m12 center-align"><div className="other-icon"><img className="responsive-img"src='https://i.imgur.com/9ZlABws.png' /></div></p>

                    <h4 className="col m12 s9 app-headers">Vault</h4>
                    <h5>Encrypt your images, videos, PDFs, and more, then share them anytime.</h5>

                  </div>
                </a>
              </div>
            </div>
            </div>
          }
        </div>
      </div>
      </div>
    );
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.origin;
      });
    }
  }
}
