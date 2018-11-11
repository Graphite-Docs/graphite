import React, { Component } from 'react';
import Header from './Header';
import Loading from './Loading';
import {
  isUserSignedIn,
  loadUserData,
  redirectToSignIn,
  isSignInPending,
  handlePendingSignIn
} from 'blockstack';
import { createUnsecuredToken } from 'jsontokens'
import { Container, Button } from 'semantic-ui-react';
const { encryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
let redirect;

export default class SSO extends Component {

  componentDidMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.href.split('=?')[0];
      });
    }
    // console.log(decodeToken(JSON.parse(localStorage.blockstack).authResponseToken).payload.public_keys[0])
    // console.log(new TokenVerifier('ES256K', decodeToken(JSON.parse(localStorage.blockstack).authResponseToken).payload.public_keys[0]).verify(JSON.parse(localStorage.blockstack).authResponseToken))
  }

  approveSSO = () => {
    let pubKey;
    if(window.location.href.includes('=?')) {
     pubKey = window.location.href.split('token=')[1].split('=?')[0];
    } else {
     pubKey = window.location.href.split('token=')[1];
    }
    const payload = {};
    payload.private = loadUserData().appPrivateKey;
    payload.public = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    payload.gaiaConfig = localStorage.getItem('blockstack-gaia-hub-config');
    const encryptedPayload = encryptECIES(pubKey, JSON.stringify(payload));
    const unsecuredToken = createUnsecuredToken(encryptedPayload)
    redirect = 'http://' + decodeURIComponent(window.location.href.split('?')[2]);
    window.location.replace(redirect + '?response=' + unsecuredToken);
  }

  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin;
    redirectToSignIn(window.location.href, origin + "/manifest.json", [
      "store_write",
      "publish_data"
    ])
  }


  render() {
    const appName = decodeURIComponent(window.location.href.split('?')[1]);
    const { loading } = this.props;

    if(!loading) {
      return (
        <div>
        <Header />
        <Container style={{marginTop: "45px"}}>

          {
            isUserSignedIn() ?
            <div className="container">

            <h1 className="landing-heading">Grant <span className='sso-app'>{appName}</span> Access to Your Graphite Account?</h1>
            <div style={{maxWidth: "80%", margin: "auto"}}>
            <div className="intro-text">
              <p>{appName} is requesting access to your account. By providing access, {appName} will be able to:</p>

              <ul>
                <li>Read your files</li>
                <li>Update your files</li>
              </ul>
            </div>
            <Button secondary style={{borderRadius: "0"}} onClick={this.approveSSO}>Approve</Button>
            </div>
            </div> :
            <div>
            <p className="intro-text">
              <span className='sso-app'>{appName}</span> is requesting access to your account. Sign in first to approve or deny access.
            </p>
            <p className="lead">
              <Button
                secondary
                style={{borderRadius: "0"}}
                id="signin-button"
                onClick={ this.handleSignIn.bind(this) }
              >
                Sign In with Blockstack
              </Button>
            </p>
            </div>
          }
        </Container>
        </div>
      );
    } else {
      return (
        <Loading />
      )
    }
  }
}
