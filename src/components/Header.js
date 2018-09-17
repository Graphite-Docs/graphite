import React, { Component } from 'react';
import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  handlePendingSignIn,
  loadUserData,
  Person,
  signUserOut,
} from 'blockstack';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Header extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
  	  person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
  	  },
  	};
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

  renderHeader() {
    if (isUserSignedIn()) {
      const userData = loadUserData();
      // console.log('userData', userData);

      const person = new Person(userData.profile);
      return (

        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>

              <ul id="nav-mobile" className="right">
                <ul id="dropdown1" className="dropdown-content">

                  {
                    window.location.pathname === '/documents' ? <li><a href="/shared-docs">Shared Files</a></li> :
                    window.location.pathname === '/sheets' ? <li><a href="/shared-sheets">Shared Files</a></li> :
                    window.location.pathname === '/vault' ? <li><a href="/shared-vault">Shared Files</a></li> :
                    <li className="hide"></li>
                  }
                  <li><a href="/integrations">Integrations</a></li>
                  <li><a href="/settings">Settings</a></li>
                  <li><a href="/export">Export All Data</a></li>
                  <li className="divider"></li>
                  <li><a onClick={ this.handleSignOut }>Sign out</a></li>
                </ul>
                <ul id="dropdown2" className="dropdown-content">
                  <li><a href="/documents"><img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" className="dropdown-icon" /><br />Documents</a></li>
                  <li><a href="/sheets"><img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" className="dropdown-icon-bigger" /><br />Sheets</a></li>
                  <li><a href="/contacts"><img src="https://i.imgur.com/st3JArl.png" alt="contacts-icon" className="dropdown-icon" /><br />Contacts</a></li>
                  <li><a href="/vault"><img src="https://i.imgur.com/9ZlABws.png" alt="vault-icon" className="dropdown-icon-file" /><br />Vault</a></li>
                </ul>
                  <li><a className="dropdown-button" href="#!" data-activates="dropdown2"><i className="material-icons apps">apps</i></a></li>
                  <li><a className="dropdown-button" href="#!" data-activates="dropdown1"><img alt="dropdown1" src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" /><i className="material-icons right">arrow_drop_down</i></a></li>
              </ul>
            </div>
          </nav>
          </div>



      );
    } else {
      return(
        <ul id="nav-mobile" className="right">
          <li><a href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a></li>
        </ul>
      );
    }
  }

  render() {
    return (
      <nav>
        <div className="nav-wrapper">
          <a href="/" className="left brand-logo text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>
          {this.renderHeader()}
        </div>
      </nav>
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
