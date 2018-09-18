import React, { Component } from "react";
import Header from './Header';
import {
  redirectToSignIn
} from 'blockstack';

export default class NoUsername extends Component {

  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin;
    redirectToSignIn(origin, origin + "/manifest.json", [
      "store_write",
      "publish_data"
    ])
  }

  render(){
    // const { handleSignIn } = this.props;
      return(
        <div>
          <Header />
          <div className="container">
            <h3>You are not experiencing all Graphite has to offer</h3>
            <p>It looks like you have a Blockstack ID without a username. We know getting a username used to cost some bitcoin, but that'{/*'*/}s not the case anymore.
            Click below to go get yourself a free username which not only gives you full access to Graphite, but gives you a truly decentralized, self-sovereign identity.</p>
            <p>You can read about getting a free username <a href="https://medium.com/the-lead/how-to-add-a-blockstack-username-to-your-id-for-free-4923e6198200">here</a>, but here are some quick steps to make sure this process is seamless: </p>
            <ol>
              <li>Click the button below</li>
              <li>Click deny when prompted to sign in with one of your usernames</li>
              <li>Click the IDs tab at the top of the screen</li>
              <li>Click "Add Username" over the ID you are using</li>
              <li>Search for a name and choose the free option (or pay for one if you would like)</li>
              <li>Sign out and sign back in with the new username (you don't{/*'*/} need to wait an hour)</li>
            </ol>
            <button onClick={this.handleSignIn} className="btn black">Get a Username</button>
          </div>
        </div>
      );
  }
}
