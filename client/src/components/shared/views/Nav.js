import React, { Component } from 'reactn';
import {
  Person,
} from 'blockstack';
import { Link } from 'react-router-dom';
import logoSquare from '../../../assets/images/graphite-mark.svg';
import { Menu, Image, Icon, Dropdown } from 'semantic-ui-react'
import { signOut } from '..//helpers/auth';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Nav extends Component {
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

  renderHeader() {
    const { userSession } = this.global;
    if (userSession.isUserSignedIn() ) {
      const userData = userSession.loadUserData();
      let person;
      if(userData) {
        person = new Person(userData.profile);
      } else {
        person = ""
      }

      const trigger = (
        <span>
          <Image src={person ? person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage : avatarFallbackImage} avatar style={{ width: "40px", height: "40px", marginRight: "15px" }} />
        </span>
      )
      return (
        <Menu className='header-menu' style={{ borderRadius: "0", background: "#000", border: "none" }}>
          <Menu.Item>
            <Link to={'/'}><Image src={logoSquare} style={{ maxHeight: "50px", marginLeft: "10px" }} /></Link>
          </Menu.Item>
          <Menu.Item position="right">
          <Dropdown icon='th' className="app-switcher" style={{ color: "#fff", marginRight: "15px" }}>
            <Dropdown.Menu>
              <Dropdown.Item><Link to={'/documents'}><Icon name='file alternate outline'/>Documents</Link></Dropdown.Item>
              <Dropdown.Item><Link to={'/files'}><Icon name='shield alternate' />Vault</Link></Dropdown.Item>
              <Dropdown.Item><Link to={'/contacts'}><Icon name='address book outline' />Contacts</Link></Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown trigger={trigger} icon={null} className="app-switcher">
              <Dropdown.Menu>
                <Dropdown.Item>Dashboard</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item><button className="link-button" onClick={signOut}>Sign Out</button></Dropdown.Item>
              </Dropdown.Menu>
          </Dropdown>
          </Menu.Item>
        </Menu>
      );
    } else {
      return(
        <Menu className='header-menu' style={{ borderRadius: "0", background: "#000", border: "none" }}>
          <Menu.Item>
            <Link to={'/'}><Image src={logoSquare} style={{ maxHeight: "50px" }} /></Link>
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
