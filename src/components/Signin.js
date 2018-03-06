import React, { Component } from 'react';
import { isUserSignedIn } from 'blockstack';

export default class Signin extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { handleSignIn } = this.props;

    return (
      <div className="welcome center-align" id="section-1">
        <h1 className="landing-heading">Welcome!</h1>
        <p className="intro-text">
        Graphite is a decentralized and encrypted replacement for Google's G-Suite. Built on Blockstack and powered by the Bitcoin Blockchain.
        </p>
        <p className="lead">
          <button
            className="log-in btn btn-primary btn-lg"
            id="signin-button"
            onClick={ handleSignIn.bind(this) }
          >
            Sign In with Blockstack
          </button>
        </p>
      </div>
    );
  }
}
