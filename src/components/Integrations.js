import React, { Component } from "react";
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile,
  handlePendingSignIn,
  isUserSignedIn,
} from "blockstack";
import {
  connectStealthy,
  loadKey,
  loadSharedDocs,
  saveDocsStealthy,
  saveIntegrations,
  loadIntegrations,
  updateIntegrations,
  disconnectStealthy,
  loadKeyDisconnect
} from './helpers/integrations';
import Header from './Header';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Integrations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      docs: [],
      integrations: {},
      stealthyConnected: false,
      stealthyKey: "",
      travelstackConnected: false,
      travelstackKey: "",
      coinsConnected: false,
      coinsKey: ""
    }
  }

  componentWillMount() {
    this.connectStealthy = connectStealthy.bind(this);
    this.loadKey = loadKey.bind(this);
    this.loadSharedDocs = loadSharedDocs.bind(this);
    this.saveDocsStealthy = saveDocsStealthy.bind(this);
    this.saveIntegrations = saveIntegrations.bind(this);
    this.loadIntegrations = loadIntegrations.bind(this);
    this.updateIntegrations = updateIntegrations.bind(this);
    this.disconnectStealthy = disconnectStealthy.bind(this);
    this.loadKeyDisconnect = loadKeyDisconnect.bind(this);
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
    isUserSignedIn ? this.loadIntegrations() : this.loadUserData();
  }

  render(){
    const { stealthyConnected, travelstackConnected, coinsConnected } = this.state;
    console.log(stealthyConnected)
      return(
        <div>
          <Header />
          <div className="container">
            <h3 className="center-align">Integrations</h3>
            <h5 className="center-align">Connect your favorite apps with the click of a button. Once connected,
            all your shared files can be easily referenced and accessed through the
            integrations you have enabled. All without sacrificing end-to-end encryption and privacy.</h5>
            <div className="integration-options row">
              <div className="col s4">
                <div className="center-align">
                  <img className="integrations-img" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="Stealthy logo" />
                  <h5>Stealthy</h5>
                </div>
              </div>
              <div className="col s8 app-description">
                <h6>Stealthy is a decentralized, end to end encrypted, p2p chat and video application built with security & privacy in mind. Secure decentralized communication. <a href="">Learn more.</a></h6>
                {stealthyConnected === true ? <button onClick={this.disconnectStealthy} className="btn btn-small grey">Disconnect</button> : <button onClick={this.connectStealthy} className="btn btn-small black">Connect</button>}
              </div>
            </div>
            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://browser.blockstack.org/images/app-icon-travelstack-256x256.png" alt="Travelstack logo" />
                <h5>Travelstack</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>Travelstack is a decentralized photo diary and social network for travelers. A new way to share your travels. <a href="">Learn more.</a></h6>
              {travelstackConnected === true ? <button onClick={this.disconnectTravelstack} className="btn btn-small grey">Disconnect</button> : <button onClick={this.connectTravelstack} className="btn btn-small black">Soon</button>}
            </div>
            </div>

            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://browser.blockstack.org/images/app-icon-coins-256x256.png" alt="Coins logo" />
                <h5>Coins</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>Coins is an encrypted cryptocurrency portfolio management tool created on top of Blockstack. Built from the ground up to measure your performance at varying scales, from fine-grain to high-level insights. <a href="">Learn more.</a></h6>
              {coinsConnected === true ? <button onClick={this.disconnectCoins} className="btn btn-small grey">Disconnect</button> : <button onClick={this.connecCoins} className="btn btn-small black">Soon</button>}
            </div>
            </div>

            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://note.riot.ai/static/img/icons/app-icon-noteriot-512x512" alt="Note Riot logo" />
                <h5>Note Riot</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>Note riot allows you to create and store encrypted notes. Categorize, filter, and style notes with complete data ownership. <a href="">Learn more.</a></h6>
              {coinsConnected === true ? <button onClick={this.disconnectCoins} className="btn btn-small grey">Disconnect</button> : <button onClick={this.connecCoins} className="btn btn-small black">Soon</button>}
            </div>
            </div>
          </div>
        </div>
      );
  }
}
