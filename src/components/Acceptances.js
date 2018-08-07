import React, { Component } from 'react';
import {
  isSignInPending,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
  isUserSignedIn,
} from 'blockstack';
import Signin from './Signin';

export default class Acceptances extends Component {

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.origin;
      });
    }
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
        { !isUserSignedIn() ?
          <Signin handleSignIn={ this.handleSignIn } />
          :
          <div className="container payment-wrapper">
            <div className="center-align">
              <h3>Confirm invite acceptance</h3>
              <button onClick={this.props.confirmAcceptance} className="btn black">Confirm Invite Acceptance</button>
            </div>
          </div>
        }
      </div>
    );
  }
}
