import React, { Component } from 'react';
import Signin from '../Signin';
import GraphiteAdmin from './GraphiteAdmin';

import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
} from 'blockstack';

export default class MainGraphiteScreen extends Component {

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
      <div className="site-wrapper">
        <div className="site-wrapper-inner">
        { !isUserSignedIn() ?
          <Signin handleSignIn={ this.handleSignIn } />
          : <GraphiteAdmin />
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
