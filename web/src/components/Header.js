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
import { Link } from 'react-router-dom';
import logo from '../assets/images/whitelogo.svg';
import logoSquare from '../assets/images/gIcon.png';
import { Menu, Image, Icon, Dropdown } from 'semantic-ui-react'
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Header extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
      loading: false,
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

  renderHeader() {
    if (isUserSignedIn() ) {
      const userData = loadUserData();
      // console.log('userData', userData);

      const person = new Person(userData.profile);
      const trigger = (
        <span>
          <Image src={person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage} avatar style={{ width: "40px", height: "40px", marginRight: "15px" }} />
        </span>
      )
      return (
        <Menu className='header-menu' style={{ borderRadius: "0", background: "#282828", border: "none" }}>
          <Menu.Item>
            <Link to={'/'}><Image src={logoSquare} style={{ maxHeight: "50px" }} /></Link>
          </Menu.Item>
          <Menu.Item position="right">
          <Dropdown icon='th' className="app-switcher" style={{ color: "#fff", marginRight: "15px" }}>
            <Dropdown.Menu>
              <Dropdown.Item><Link to={'/documents'}><Icon name='file alternate outline'/>Documents</Link></Dropdown.Item>
              <Dropdown.Item><Link to={'/sheets'}><Icon name='table' />Sheets</Link></Dropdown.Item>
              <Dropdown.Item><Link to={'/vault'}><Icon name='shield alternate' />Vault</Link></Dropdown.Item>
              <Dropdown.Item><Link to={'/contacts'}><Icon name='address book outline' />Contacts</Link></Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown trigger={trigger} icon={null} className="app-switcher">
              <Dropdown.Menu>
                {
                  window.location.pathname === '/documents' ? <Dropdown.Item><Link to={'/shared-docs'}>Shared Docs</Link></Dropdown.Item> :
                  window.location.pathname === '/sheets' ? <Dropdown.Item><Link to={'/shared-sheets'}>Shared Sheets</Link></Dropdown.Item> :
                  window.location.pathname === '/vault' ? <Dropdown.Item><Link to={'/shared-vault'}>Shared Vault</Link></Dropdown.Item> :
                  null
                }
                <Dropdown.Item><Link to={'/profile'}>Profile</Link></Dropdown.Item>
                <Dropdown.Item><Link to={'/integrations'}>Integrations</Link></Dropdown.Item>
                <Dropdown.Item><Link to={'/settings'}>Team Management</Link></Dropdown.Item>
                <Dropdown.Item><Link to={'/export'}>Export All Data</Link></Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item><a onClick={this.handleSignOut}>Sign Out</a></Dropdown.Item>
              </Dropdown.Menu>
          </Dropdown>
          </Menu.Item>
        </Menu>
      );
    } else if(!isUserSignedIn) {
      return(
        <Menu style={{ borderRadius: "0", background: "#282828", border: "none" }}>
          <Menu.Item>
            <Link to={'/'}><Image src={logo} style={{ maxHeight: "50px" }} /></Link>
          </Menu.Item>
          <Menu.Item position="right">
            <a style={{ color: "#fff" }} href="https://graphitedocs.com/about" target="_blank" rel="noopener noreferrer">About</a>
          </Menu.Item>
        </Menu>
      );
    }
  }

  render() {
    return (
        <div>{this.renderHeader()}</div>
    );
  }
}
