import React, { Component } from 'react';
import Signin from '../Signin';
import SheetsCollections from './SheetsCollections';
import {
  isSignInPending,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
} from 'blockstack';
import {
  isSignedIn
} from '../helpers/authentication';

export default class MainSheets extends Component {

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
          { !isSignedIn() ?
            <Signin handleSignIn={ this.handleSignIn } />
            : <SheetsCollections
                results={this.props.results}
                loading={this.props.loading}
                handleNewContact={this.props.handleNewContact}
                handleTagChange={this.props.handleTagChange}
                addTagManual={this.props.addTagManual}
                deleteTag={this.props.deleteTag}
                tag={this.props.tag}
                displayMessage={this.props.displayMessage}
              />
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
