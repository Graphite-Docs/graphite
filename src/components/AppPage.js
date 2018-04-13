import React, { Component } from 'react';
import Signin from './Signin';
import Header from './Header';
import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
} from 'blockstack';

export default class AppPage extends Component {

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
                    <div className="col s3 m12 center-align"><p className="icon docs-icon"><img alt="docs" className=""src='https://i.imgur.com/C71m2Zs.png' /></p></div>
                    <h4 className="col m12 s9 app-headers">Documents</h4>
                  </div>
                </a>
              </div>
              <div className="col s12 m6 l2 app-page">
                <a className="black-text" href="/sheets">
                  <div className="center-align app-card row sheets-card">
                    <div className="col s3 m12 center-align"><p className="icon sheets-icon"><img alt="sheets"className="responsive-img" src='https://i.imgur.com/6jzdbhE.png' /></p></div>
                    <h4 className="col m12 s9 app-headers">Sheets</h4>
                  </div>
                </a>
              </div>
              <div className="col s12 m6 l2 app-page">
                <a className="black-text" href="/contacts">
                  <div className="center-align app-card row contacts-card">
                    <div className="col s3 m12 center-align"><p className="icon contacts-icon"><img alt="contacts" className=""src='https://i.imgur.com/st3JArl.png' /></p></div>
                    <h4 className="col m12 s9 app-headers">Contacts</h4>
                  </div>
                </a>
              </div>
              <div className="col s12 m6 l2 app-page">
                <a className="black-text" href="/conversations">
                  <div className="center-align app-card row convos">
                    <div className="col s3 m12 center-align"><p className="icon conversations-icon"><img alt="conversations" className="" src='https://i.imgur.com/cuXF1V5.png' /></p></div>
                    <h4 className="col m12 s9 app-headers">Conversations</h4>
                  </div>
                </a>
              </div>
              <div className="col s12 m6 l2 app-page">
                <a className="black-text" href="/vault">
                  <div id="apps" className="center-align app-card files-card row">
                    <div className="col s3 m12 center-align"><p className="icon other-icon"><img alt="other" className="responsive-img"src='https://i.imgur.com/9ZlABws.png' /></p></div>
                    <h4 className="col m12 s9 app-headers">Vault</h4>
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
