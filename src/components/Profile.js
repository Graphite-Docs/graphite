import React, { Component } from 'react';
import Header from './Header';
import {
  loadUserData
} from 'blockstack';

// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {

  componentDidMount() {
    window.$('.modal').modal();
    this.props.loadProfile();
  }

  render() {
    return (
      <div>
        <Header />
        <div className="container">
          <h3 className="center-align">Profile</h3>
          <p className="note center-align">Any updates made here are public</p>
          <div className="row">
            <div className="col s12 m12 l6">
              <div className="card medium center-align profile-card">
                <h4>Basic Info</h4>
                <h5>Name</h5>
                <p>{loadUserData().profile.name ? loadUserData().profile.name : "Anonymous"}</p>
                <h5>Username</h5>
                <p>{loadUserData().username}</p>
                <h5>Identity Address</h5>
                <p>{loadUserData().identityAddress}</p>
                <h5>Decentralized Identifier</h5>
                <p>{loadUserData().decentralizedID}</p>
              </div>
            </div>
            <div className="col s12 m12 l6">
              <div className="card medium center-align profile-card">
                <h4>Settings</h4>
                <h5>Email Notifications <span className="note"><a href="#emailInfo" className="modal-trigger"><i className="material-icons">info_outline</i></a></span></h5>
                <p>When someone shares files with you</p>
                <div className="switch">
                  <label>
                    No
                    <input type="checkbox" name="emailOK" checked={this.props.emailOK} onChange={this.props.handleEmailSetting} />
                    <span className="lever"></span>
                    Yes
                  </label>
                </div>
                <h5>Email (required for notifications)</h5>
                <p className="container"><input type='text' placeholder='sally@email.com' value={this.props.profileEmail} onChange={this.props.handleProfileEmail} /></p>
                <div>
                  <button className="btn" onClick={this.props.saveProfile}>Save</button>
                </div>
              </div>
            </div>
            {/*email info modal*/}
            <div id="emailInfo" className="modal">
              <div className="modal-content">
                <h4>Email Notifications</h4>
                <p>By adding your email address here, you are exposing that email in a publicly accessible file, stored in your Gaia storage hub.
                The email will never be used for anything other than sending a notification that a new file has been shared, but if you are not comfortable with your
                email address being discoverable, do not opt into this and do not enter your email address.</p>
              </div>
              <div className="modal-footer">
                <a className="modal-action modal-close waves-effect waves-green btn-flat">Got it</a>
              </div>
            </div>
            {/*end email info modal */}
          </div>
        </div>
      </div>
    );
  }
}
