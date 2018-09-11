import React, { Component } from 'react';
import {
  isSignInPending,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
  isUserSignedIn,
} from 'blockstack';
import LoadingBar from './LoadingBar';
import Signin from './Signin';
import Header from './Header';

export default class Acceptances extends Component {

  componentDidMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.href.split('&')[0];
      });
    }
  }

  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin
    redirectToSignIn(window.location.href, origin + '/manifest.json', ['store_write', 'publish_data'])
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  render() {
    const { loadingIndicator } = this.props;
    return (
      <div>
        { !isUserSignedIn() ?
          <Signin handleSignIn={ this.handleSignIn } />
          :
          <div>
          <Header />
          <div className="container payment-wrapper">
            <div className="center-align">

              {loadingIndicator ?
                <LoadingBar /> :
                <div>
                  <h3>Confirm invite acceptance</h3>
                  <button onClick={this.props.confirmAcceptance} className="btn black">Confirm Invite Acceptance</button>
                </div>
              }

            </div>
          </div>
          </div>
        }
      </div>
    );
  }
}
